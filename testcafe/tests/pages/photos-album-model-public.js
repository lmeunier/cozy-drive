import { t, Selector } from 'testcafe'
import {
  getPageUrl,
  getElementWithTestId,
  isExistingAndVisibile,
  goBack
} from '../helpers/utils'
import Commons from '../pages/photos-commons'

const commons = new Commons()

export default class Page {
  constructor() {
    this.logo = Selector('.coz-nav-apps-btns-home')

    this.albumPublicLayout = getElementWithTestId('pho-public-layout')
    this.toolbarPublicAlbum = getElementWithTestId('pho-toolbar-album-public')
    this.btnPublicCreateCozy = this.toolbarPublicAlbum
      .find('[class*="c-btn"]')
      .nth(0)
    this.btnPublicDownload = getElementWithTestId('album-public-download')
    this.btnPublicDownloadMobile = getElementWithTestId(
      'album-public-download-mobile'
    )
    this.btnMoreButton = getElementWithTestId('more-button').find('button')
    this.innerPublicMoreMenu = Selector('[class*="c-menu__inner--opened"]')
    this.btnPublicDownloadMobile = getElementWithTestId(
      'album-public-download-mobile'
    )

    //not available
    this.errorAvailable = getElementWithTestId('empty-share')
  }

  async waitForLoading() {
    await t.expect(commons.loading.exists).notOk('Page still loading')
    await isExistingAndVisibile(this.albumPublicLayout, 'Album Public Layout')
  }

  async checkCreateCozy() {
    await t
      .expect(getPageUrl())
      .eql(
        'https://manager.cozycloud.cc/cozy/create?pk_campaign=sharing-photos'
      )
    await goBack()
    await this.waitForLoading()
  }

  async checkActionMenuAlbumDesktop() {
    //TODO https://trello.com/c/qwbIUoRk/1638-partage-par-lien-vue-publique-boutons-vs-liens
    await t //Mobile elements don't exist/are not visible
      .expect(this.btnMoreButton.visible)
      .notOk('[...] Menu is visible')
      .expect(this.btnPublicDownloadMobile.exists)
      .notOk('Mobile download button exists')

    await isExistingAndVisibile(this.logo, 'Logo')
    await isExistingAndVisibile(this.toolbarPublicAlbum, 'toolbarPublicAlbum')
    await isExistingAndVisibile(
      this.btnPublicCreateCozy,
      'Create my Cozy Button'
    )
    await isExistingAndVisibile(this.btnPublicDownload, 'Download FolderButton')
  }

  async checkActionMenuAlbumMobile() {
    //TODO https://trello.com/c/qwbIUoRk/1638-partage-par-lien-vue-publique-boutons-vs-liens
    await t //desktop elements don't exist/are not visible
      .expect(this.btnPublicDownload.visible)
      .notOk('[...] Menu is visible')
      .expect(this.logo.visible)
      .notOk('[...] Logo is visible')

    // same create cozy btn in desktop & mobile
    await isExistingAndVisibile(
      this.btnPublicCreateCozy,
      'Create my Cozy Button'
    )
    await isExistingAndVisibile(this.btnMoreButton, '[...] Menu')
    await t.click(this.btnMoreButton)
    await isExistingAndVisibile(this.innerPublicMoreMenu, 'inner [...] Menu')
    await isExistingAndVisibile(
      this.btnPublicDownloadMobile,
      'Mobile download button'
    )
    // Close [...] menu after check
    await t.click(this.btnMoreButton)
  }

  async checkNotAvailable() {
    await isExistingAndVisibile(this.errorAvailable, 'Not available div')
    await t
      .expect(this.errorAvailable.innerText)
      .contains('Sorry, this link is no longer available.') //!FIXME
  }
}
