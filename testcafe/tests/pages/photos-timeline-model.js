import { Selector, t } from 'testcafe'
import {
  getPageUrl,
  getElementWithTestId,
  isExistingAndVisibile
} from '../helpers/utils'
import Commons from '../pages/photos-commons'
const commons = new Commons()

export default class Page {
  constructor() {
    this.contentWrapper = getElementWithTestId('timeline-pho-content-wrapper')

    // Upload
    this.btnUpload = getElementWithTestId('upload-btn')
    this.divUpload = getElementWithTestId('upload-queue')
    this.divUploadSuccess = getElementWithTestId('upload-queue-success')

    //Top Option bar & Confirmation Modal
    //those buttons are defined in cozy-ui (SelectionBar), so we cannot add data-test-id on them
    this.barPhotoBtnAddtoalbum = commons.barPhoto.find('button').nth(0) //ADD TO ALBUM
    this.barPhotoBtnDl = commons.barPhoto.find('button').nth(1) //DOWNLOAD
    this.barPhotoBtnDeleteOrRemove = commons.barPhoto.find('button').nth(2) //DELETE OR REMOVE FROM ALBUM

    // Photo fullscreen
    this.photoFull = Selector('[class*="pho-viewer-imageviewer"]').find('img')
    this.photoNavNext = getElementWithTestId('viewer-nav--next')
    this.photoNavNextBtn = this.photoNavNext.find(
      '[class*="pho-viewer-nav-arrow"]'
    )
    this.photoNavPrevious = getElementWithTestId('viewer-nav--previous')
    this.photoNavPreviousBtn = this.photoNavPrevious.find(
      '[class*="pho-viewer-nav-arrow"]'
    )
    this.photoBtnClose = getElementWithTestId('btn-viewer-toolbar-close')
  }

  async waitForLoading() {
    await t.expect(commons.loading.exists).notOk('Page still loading')
    await isExistingAndVisibile(this.contentWrapper, 'Content Wrapper')
  }

  async initPhotoCountZero() {
    console.log(`Number of pictures on page (Before test): 0`)
    t.ctx.allPhotosStartCount = 0
  }

  async initPhotosCount() {
    t.ctx.allPhotosStartCount = await commons.getPhotosCount('Before')
  }

  async uploadPhotos(files) {
    const numOfFiles = files.length
    console.log('Uploading ' + numOfFiles + ' picture(s)')

    await isExistingAndVisibile(this.btnUpload, 'Upload Button')
    await t.setFilesToUpload(this.btnUpload, files)
    await isExistingAndVisibile(this.divUpload, 'Upload div')
    await isExistingAndVisibile(
      this.divUploadSuccess,
      'Upload pop-in successfull'
    )
    await isExistingAndVisibile(commons.alertWrapper, 'Photo(s) uploaded')
    await t
      .expect(this.divUpload.innerText)
      .match(
        new RegExp('([' + numOfFiles + '].*){2}'),
        'Numbers of pictures uploaded does not match'
      )
    await t.takeScreenshot()
    const allPhotosEndCount = await commons.getPhotosCount('After')
    await t
      .expect(allPhotosEndCount)
      .eql(t.ctx.allPhotosStartCount + numOfFiles)
  }

  async checkPhotobar() {
    await isExistingAndVisibile(commons.barPhoto, 'Selection bar')
    await isExistingAndVisibile(
      this.barPhotoBtnAddtoalbum,
      'Button "Add to Album"'
    )
    await isExistingAndVisibile(this.barPhotoBtnDl, 'Button "Download"')
    await isExistingAndVisibile(
      this.barPhotoBtnDeleteOrRemove,
      'Button "Delete"'
    )
    //!FIXME Add check on label text
  }

  async openPhotoFullscreen(index) {
    await isExistingAndVisibile(
      commons.photoThumb(index),
      `${index}th Photo thumb`
    )

    await t.click(commons.photoThumb(index))
    await isExistingAndVisibile(this.photoFull, 'fullscreen photos')
  }

  async closePhotoFullscreenX() {
    //Pic closed using Button
    await isExistingAndVisibile(this.photoBtnClose, 'Button Close')
    await t
      .click(this.photoBtnClose)
      .expect(this.photoFull.exists)
      .notOk('Photo is still in fullscreen view')
  }

  async closePhotoFullscreenEsc() {
    //Pic closed using 'esc'
    await t
      .pressKey('esc')
      .expect(this.photoFull.exists)
      .notOk('Photo is still in fullscreen view')
  }

  async navigateToNextPhoto(index) {
    if (index == t.ctx.allPhotosStartCount - 1) {
      //this is the last picture, so next button does not exist
      await t
        .expect(this.photoNavNext.exists)
        .notOk('Next button on last picture')
    } else {
      const photo1src = await this.photoFull.getAttribute('src')
      const photo1url = await getPageUrl()
      await isExistingAndVisibile(this.photoNavNext, 'Div photo Next')
      await t.hover(this.photoNavNext) //not last photo, so next button should exists
      await isExistingAndVisibile(this.photoNavNextBtn, 'Next arrow')
      await t.click(this.photoNavNextBtn)

      const photo2src = await this.photoFull.getAttribute('src')
      const photo2url = await getPageUrl()
      //Photo has change, so src & url are different
      await isExistingAndVisibile(this.photoFull, '(next) fullscreen photos')
      await t.expect(photo1src).notEql(photo2src)
      await t.expect(photo1url).notEql(photo2url)
      //!FIXME add data-photo-id=xxx in photo and check url=#/photos/xxx
    }
  }

  async navigateToPrevPhoto(index) {
    if (index == 0) {
      //this is the 1st picture, so previous button does not exist
      await t
        .expect(this.photoNavPrevious.exists)
        .notOk('Previous button on first picture')
    } else {
      const photo1src = await this.photoFull.getAttribute('src')
      const photo1url = await getPageUrl()
      await isExistingAndVisibile(this.photoNavPrevious, 'Div photo prev')

      await t.hover(this.photoNavPrevious) //not 1st photo, so previous button should exists
      await isExistingAndVisibile(this.photoNavPreviousBtn, 'prev arrow')
      await t.click(this.photoNavPreviousBtn)

      const photo2src = await this.photoFull.getAttribute('src')
      const photo2url = await getPageUrl()
      //Photo has change, so src & url are different
      await isExistingAndVisibile(this.photoFull, '(prev) fullscreen photos')
      await t.expect(photo1src).notEql(photo2src)
      await t.expect(photo1url).notEql(photo2url)
      //!FIXME add data-photo-id=xxx in photo and check url=#/photos/xxx
    }
  }

  //@param { number } numOfFiles : number of file to delete
  //@param { bool } isRemoveAll: true if all photos are supposed to be remove at the end
  async deletePhotos(numOfFiles, isRemoveAll) {
    await isExistingAndVisibile(commons.barPhoto, 'Selection bar')

    console.log('Deleting ' + numOfFiles + ' picture(s)')
    await isExistingAndVisibile(this.barPhotoBtnDeleteOrRemove, 'Delete Button')
    await t.click(this.barPhotoBtnDeleteOrRemove)

    await isExistingAndVisibile(commons.modalDelete, 'Modal delete')
    await isExistingAndVisibile(
      commons.modalDeleteBtnDelete,
      'Modal delete button Delete'
    )
    await t.click(commons.modalDeleteBtnDelete)
    await t.takeScreenshot()

    let allPhotosEndCount
    if (isRemoveAll) {
      await isExistingAndVisibile(commons.folderEmpty, 'Folder Empty')
      console.log(`Number of pictures on page (Before test): 0`)
      allPhotosEndCount = 0
    } else {
      allPhotosEndCount = await commons.getPhotosCount('After')
    }

    await t
      .expect(allPhotosEndCount)
      .eql(t.ctx.allPhotosStartCount - numOfFiles)
  }
}
