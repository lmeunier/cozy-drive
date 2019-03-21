import { t, Selector } from 'testcafe'
import {
  getElementWithTestId,
  isExistingAndVisibile
} from '../../helpers/utils'
import Commons from '../../pages/photos-commons'
const commons = new Commons()

export default class Page {
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

    this.imageViewer = getElementWithTestId('viewer-image')
    this.imageViewerContent = this.imageViewer.find('img')
  }

  async waitForLoading() {
    await t.expect(this.spinner.exists).notOk('Spinner still spinning')
    await isExistingAndVisibile(this.viewerWrapper, 'Viewer Wrapper')
    await isExistingAndVisibile(this.viewerControls, 'Viewer Controls')
    await isExistingAndVisibile(this.viewerToolbar, 'Viewer Toolbar')
    console.log('Viewer Ok')
  }

  //@param {number} index: index of open file
  async openViewerForPhotoIndex(index) {
    await isExistingAndVisibile(
      commons.photoThumb(index),
      `${index}th Photo thumb`
    )
    await t.click(commons.photoThumb(index))
    await this.waitForLoading()
  }

  //@param { bool } exitWithEsc : true to exit by pressing esc, false to click on the button
  async closeViewer(exitWithEsc) {
    await t.hover(this.viewerWrapper)
    await isExistingAndVisibile(this.viewerBtnClose, 'Close button')
    exitWithEsc ? await t.pressKey('esc') : await t.click(this.viewerBtnClose)
  }

  //@param {number} index: index of open file (need to know if it's first or last file)
  async navigateToNextFile_vr(screenshotPath, index) {
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
      await this.waitForLoading()

      //avoid unwanted hover for screenshots
      await t.hover(this.viewerWrapper, {
        offsetX: 0,
        offsetY: 0
      })
      await t.fixtureCtx.vr.takeScreenshotAndUpload(
        `${screenshotPath}-${index}-next`
      )
    }
  }

  //@param {number} index: index of open file (need to know if it's first or last file)
  async navigateToPrevFile_vr(screenshotPath, index) {
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
      await this.waitForLoading()

      //avoid unwanted hover for screenshots
      await t.hover(this.viewerWrapper, {
        offsetX: 0,
        offsetY: 0
      })
      await t.fixtureCtx.vr.takeScreenshotAndUpload(
        `${screenshotPath}-${index}-prev`
      )
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
  //@param {number} startIndex : index of the 1st photos to open
  //@param {number} numberOfNavigation : the number of file we want to go through during the test.
  async checkViewerNavigation_vr(
    screenshotPath,
    startIndex,
    numberOfNavigation
  ) {
    console.log(`↳ 📁 photo with index : ${startIndex}`)
    await this.openViewerForPhotoIndex(startIndex)

    for (let i = startIndex; i <= startIndex + numberOfNavigation - 1; i++) {
      await this.navigateToNextFile_vr(screenshotPath, i)
    }
    for (let i = startIndex + numberOfNavigation - 1; i >= startIndex; i--) {
      await this.navigateToPrevFile_vr(screenshotPath, i)
    }
    await this.closeViewer({
      exitWithEsc: false
    })
  }

  // perform checks commons to all viewer : navigation / toolbar download btn / closing viewer
  //@param {String} screenshotPath : path for screenshots taken in this test
  //@param {number} index: index of open file
  async checkPublicImageViewer_vr(screenshotPath, index) {
    console.log(`↳ 📁 photo ${index}`)
    await this.openViewerForPhotoIndex(index)

    await isExistingAndVisibile(this.imageViewer, 'image viewer')
    await isExistingAndVisibile(
      this.imageViewerContent,
      'image viewer controls'
    )
    await t.fixtureCtx.vr.takeScreenshotAndUpload(screenshotPath)
  }
}
