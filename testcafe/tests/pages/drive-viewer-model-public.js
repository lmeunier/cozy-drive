import { t, Selector } from 'testcafe'
import { getElementWithTestId, isExistingAndVisibile } from '../helpers/utils'
import DriveVRPage from '../pages/drive-model'
import PRECISION from '../helpers/visualreview-utils'
const drivePage = new DriveVRPage()

export default class PublicViewerPage {
  constructor() {
    this.spinner = Selector('[class*="c-spinner"]')
    this.viewerWrapper = getElementWithTestId('viewer-wrapper')
    this.viewerControls = getElementWithTestId('pho-viewer-controls')
    this.viewerToolbar = getElementWithTestId('viewer-toolbar')
    this.btnDownloadViewerToolbar = getElementWithTestId(
      'viewer-toolbar-download'
    )

    // Navigation in viewer
    this.viewerNavNext = getElementWithTestId('viewer-nav--next')
    this.viewerNavNextBtn = this.viewerNavNext.find(
      '[class*="pho-viewer-nav-arrow"]'
    )
    this.viewerNavPrevious = getElementWithTestId('viewer-nav--previous')
    this.viewerNavPreviousBtn = this.viewerNavPrevious.find(
      '[class*="pho-viewer-nav-arrow"]'
    )
    this.viewerBtnClose = getElementWithTestId('btn-viewer-toolbar-close')

    //Viewer type
    this.audioViewer = getElementWithTestId('viewer-audio')
    this.audioViewerControls = this.audioViewer.find('audio')
    this.imageViewer = getElementWithTestId('viewer-image')
    this.imageViewerContent = this.imageViewer.find('img')
    this.txtViewer = getElementWithTestId('viewer-text')
    this.txtViewerContent = this.txtViewer.find(
      '[class*="pho-viewer-textviewer-content"]'
    )
    this.videoViewer = getElementWithTestId('viewer-video')
    this.videoViewerControls = this.videoViewer.find('video')
    this.noViewer = getElementWithTestId('viewer-noviewer')
    this.btnNoViewerDownload = this.noViewer.find('button')

    this.pdfViewer = getElementWithTestId('viewer-pdf')
    this.btnPdfViewerDownload = this.pdfViewer.find('#download')
  }

  async waitForLoading() {
    await t.expect(this.spinner.exists).notOk('Spinner still spinning')
    await isExistingAndVisibile(this.viewerWrapper, 'Viewer Wrapper')
    await isExistingAndVisibile(this.viewerControls, 'Viewer Controls')
    await isExistingAndVisibile(this.viewerToolbar, 'Viewer Toolbar')
    console.log('Viewer Ok')
  }

  //@param {String} fileName
  async openViewerForFile(fileName) {
    await t
      .expect(drivePage.folderOrFileName.withText(fileName).exists)
      .ok(`No folder named ${fileName}`)
      .click(drivePage.folderOrFileName.withText(fileName))

    await this.waitForLoading()
    console.log(`Navigation to ${fileName} OK!`)
  }

  //@param { bool } exitWithEsc : true to exit by pressing esc, false to click on the button
  async closeViewer(exitWithEsc) {
    await t.hover(this.viewerWrapper)
    await isExistingAndVisibile(this.viewerBtnClose, 'Close button')
    exitWithEsc ? await t.pressKey('esc') : await t.click(this.viewerBtnClose)
  }

  //@param {number} index: index of open file (need to know if it's first or last file)
  async navigateToNextFile(index) {
    if (index == t.ctx.totalFilesCount - 1) {
      //this is the last picture, so next button does not exist
      await t
        .expect(this.viewerNavNext.exists)
        .notOk('Next button on last picture')
    } else {
      await t
        .hover(this.viewerNavNext) //not last photo, so next button should exists
        .expect(this.viewerNavNextBtn.visible)
        .ok('Next arrow does not show up')
        .click(this.viewerNavNextBtn)
    }
  }

  //@param {number} index: index of open file (need to know if it's first or last file)
  async navigateToPrevFile(index) {
    if (index == 0) {
      //this is the 1st picture, so previous button does not exist
      await t
        .expect(this.viewerNavPrevious.exists)
        .notOk('Previous button on first picture')
    } else {
      await t
        .hover(this.viewerNavPrevious) //not 1st photo, so previous button should exists
        .expect(this.viewerNavPreviousBtn.visible)
        .ok('Previous arrow does not show up')
        .click(this.viewerNavPrevious)
    }
  }

  async downloadWithToolbar() {
    await t.hover(this.viewerWrapper)
    await isExistingAndVisibile(
      this.btnDownloadViewerToolbar,
      'Download button in toolbar'
    )
    await t
      .setNativeDialogHandler(() => true)
      .click(this.btnDownloadViewerToolbar)
  }

  //@param {String} screenshotPath : path for screenshots taken in this test
  //@param {string} fileStartName : file to open to start the navigation testing
  //@param {number} numberOfNavigation : the number of file we want to go through during the test.
  async checkViewerNavigation_vr(
    screenshotPath,
    fileStartName,
    numberOfNavigation
  ) {
    const startIndex = await drivePage.getElementIndex(fileStartName)
    console.log(`↳ 📁 ${fileStartName} with index : ${startIndex}`)
    await this.openViewerForFile(fileStartName)

    for (let i = startIndex; i < startIndex + numberOfNavigation; i++) {
      await this.navigateToNextFile(i)
      await t.fixtureCtx.vr.takeScreenshotAndUpload(
        `${screenshotPath}-${i}-next`
      )
    }

    for (let i = startIndex + numberOfNavigation; i > startIndex; i--) {
      await this.navigateToPrevFile(i)
      await t.fixtureCtx.vr.takeScreenshotAndUpload(
        `${screenshotPath}-${i}-prev`
      )
    }
    await this.closeViewer({
      exitWithEsc: false
    })
  }

  // perform checks commons to all viewer : navigation / toolbar download btn / closing viewer
  //@param {String} screenshotPath : path for screenshots taken in this test
  //@param {string} filename : file to check
  //@param {string} type : file type to check for Specific viewer
  async checkPublicViewer_vr(screenshotPath, fileName, type) {
    const index = await drivePage.getElementIndex(fileName)
    console.log(`↳ 📁 ${fileName} with index : ${index}`)
    await this.openViewerForFile(fileName)

    switch (type) {
      case 'img':
        await this.checkImageViewer()
        break
      case 'txt':
        await this.checkTextViewer()
        break
      case 'audio':
        await this.checkAudioViewer()
        break
      case 'video':
        await this.checkVideoViewer()
        break
      default:
        await this.checkNoViewer()
        break
    }
    //avoid unwanted hover for screenshots
    await t.hover(this.viewerWrapper, {
      offsetX: 0,
      offsetY: 0
    })
    await t.fixtureCtx.vr.takeScreenshotAndUpload(screenshotPath)
    //precision back to default
    t.fixtureCtx.vr.options.compareSettings = {
      precision: PRECISION //precision goes from 0 to 255
    }
  }

  async checkCommonViewerDownload(fileName) {
    await this.openViewerForFile(fileName)
    await this.downloadWithToolbar()
    await this.closeViewer({
      exitWithEsc: true
    })
  }
  //
  //Specific check for audioViewer
  async checkAudioViewer() {
    await isExistingAndVisibile(this.audioViewer, 'Audio viewer')
    await isExistingAndVisibile(
      this.audioViewerControls,
      'Audio viewer controls'
    )
    //wait for file to load to get a good screenshots
    await t.wait(5000)
    //modify precision to avoid false positive due to loading state
    t.fixtureCtx.vr.options.compareSettings = {
      precision: 100 //precision goes from 0 to 255
    }
  }

  //Specific check for videoViewer
  async checkVideoViewer() {
    await isExistingAndVisibile(this.videoViewer, 'Video viewer')
    await isExistingAndVisibile(
      this.videoViewerControls,
      'Video viewer controls'
    )
    //wait for file to load to get a good screenshots
    await t.wait(5000)
    //modify precision to avoid false positive due to loading state
    t.fixtureCtx.vr.options.compareSettings = {
      precision: 100 //precision goes from 0 to 255
    }
  }

  //Specific check for textViewer
  async checkTextViewer() {
    await isExistingAndVisibile(this.txtViewer, 'text viewer')
    await isExistingAndVisibile(this.txtViewerContent, 'text viewer controls')
  }

  //Specific check for imageViewer
  async checkImageViewer() {
    await isExistingAndVisibile(this.imageViewer, 'image viewer')
    await isExistingAndVisibile(
      this.imageViewerContent,
      'image viewer controls'
    )
  }

  //Specific check for no-viewer
  async checkNoViewer() {
    await isExistingAndVisibile(this.noViewer, 'no-viewer Viewer')
  }

  //Specific check for no viewer : other download btn
  async checkNoViewerDownload(fileName) {
    await this.openViewerForFile(fileName)
    await isExistingAndVisibile(
      this.btnNoViewerDownload,
      'no Viewer Download butoon'
    )
    await t.setNativeDialogHandler(() => true).click(this.btnNoViewerDownload)

    await this.closeViewer({
      exitWithEsc: true
    })
  }

  //@param {String} screenshotPath : path for screenshots taken in this test
  //@param {string} filename : file to check
  async checkMobilePublicViewer_vr(screenshotsPath, fileName) {
    await t.resizeWindowToFitDevice('iPhone 6', {
      portraitOrientation: true
    })

    await this.openViewerForFile(fileName)

    await t.fixtureCtx.vr.takeScreenshotAndUpload(screenshotsPath)
    await t.maximizeWindow() //Back to desktop
  }
}
