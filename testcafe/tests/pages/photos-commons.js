//!FIXME Change selector (ID or react)
import { Selector, t } from 'testcafe'
import {
  getPageUrl,
  getElementWithTestId,
  isExistingAndVisibile,
  checkAllImagesExists
} from '../helpers/utils'

export default class Page {
  constructor() {
    this.folderEmpty = getElementWithTestId('empty-folder')
    this.loading = getElementWithTestId('loading')
    this.photoSection = getElementWithTestId('photo-section')

    //Sidebar
    this.sidebar = Selector('[class*="pho-sidebar"]')
    this.btnNavToAlbum = getElementWithTestId('nav-to-albums')

    //Top Option bar & Confirmation Modal
    this.barPhoto = Selector('[class*="coz-selectionbar"]')

    //Modal
    this.modalDelete = Selector('[class*="c-modal"]').find('div')
    this.modalDeleteBtnDelete = this.modalDelete.find('button').nth(2) //REMOVE
    this.alertWrapper = Selector('[class*="c-alert-wrapper"]')

    //thumbnails & photos
    this.allPhotosWrapper = this.photoSection.find('[class^="pho-photo"]')
    this.allPhotos = getElementWithTestId('pho-photo-item')
    this.photoThumb = value => {
      return Selector('[class*="pho-photo-item"]').nth(value)
    }
    this.photoToolbar = Selector(
      '[class*="coz-selectionbar pho-viewer-toolbar-actions"]'
    )
    this.photoCheckbox = Selector(
      '[class*="pho-photo-select"][data-input="checkbox"]'
    )
  }

  async goToAlbums() {
    await isExistingAndVisibile(this.sidebar, 'Sidebar')
    await isExistingAndVisibile(this.btnNavToAlbum, 'Album Button')
    await t
      .click(this.btnNavToAlbum)
      .expect(getPageUrl())
      .contains('albums')
  }

  //@param {string} when : text for console.log
  //photoCount still failed sometimes, so let's try twice
  async getPhotosCount(when) {
    await checkAllImagesExists()
    let allPhotosCount = await this.tryGetPhotosCount(when)
    //try a second time to defined allPhotosCount is 1st try failed
    if (typeof allPhotosCount === 'undefined') {
      allPhotosCount = await this.tryGetPhotosCount(when)
    }
    return allPhotosCount
  }

  //@param {string} when : text for console.log
  async tryGetPhotosCount(when) {
    let allPhotosCount
    if ((await this.folderEmpty.exists) && (await this.folderEmpty.visible)) {
      allPhotosCount = 0
    } else if (
      (await this.photoSection.exists) &&
      (await this.photoSection.visible)
    ) {
      await isExistingAndVisibile(this.allPhotosWrapper, 'Picture wrapper')
      await isExistingAndVisibile(this.allPhotos, 'Photo item(s)')
      allPhotosCount = await this.allPhotos.count
    }
    console.log(`Number of pictures on page (${when} test):  ${allPhotosCount}`)
    return allPhotosCount
  }

  async selectPhotos(numOfFiles) {
    console.log('Selecting ' + numOfFiles + ' picture(s)')
    await isExistingAndVisibile(this.photoThumb(0), '1st Photo thumb')
    await t.hover(this.photoThumb(0)) //Only one 'hover' as all checkbox should be visible once the 1st checkbox is checked

    for (let i = 0; i < numOfFiles; i++) {
      await isExistingAndVisibile(this.photoThumb(i), `${i + 1}th Photo thumb`)
      await t.click(this.photoCheckbox.nth(i))
    }
  }
}
