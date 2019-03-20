import { Role } from 'testcafe'
import { photosUser } from '../helpers/roles'
import {
  TESTCAFE_PHOTOS_URL,
  deleteLocalFile,
  checkLocalFile,
  setDownloadPath
} from '../helpers/utils'
import TimelinePage from '../pages/photos-timeline-model'
import AlbumPage from '../pages/photos-album-model'
import AlbumsPage from '../pages/photos-albums-model'
import Commons from '../pages/photos-commons'
import PublicAlbumPage from '../pages/photos-album-model-public'

const timelinePage = new TimelinePage()
const photoAlbumPage = new AlbumPage()
const photoAlbumsPage = new AlbumsPage()
const photosCommons = new Commons()
const publicAlbumPage = new PublicAlbumPage()
let data = require('../helpers/data')

//************************
//Tests when authentified
//************************
fixture`Album link Sharing Scenario`.page`${TESTCAFE_PHOTOS_URL}/`.beforeEach(
  async t => {
    console.group(`\n↳ ℹ️  Loggin & Initialization`)
    await t.useRole(photosUser)
    await timelinePage.waitForLoading()
    await timelinePage.initPhotosCount()
    console.groupEnd()
  }
)

test('Go into Album view, and create new album with 3 photos', async () => {
  console.group('↳ ℹ️  Go into Album view, and create new album with 3 photos')
  await photosCommons.goToAlbums()
  await photoAlbumsPage.addNewAlbum(data.ALBUM_DATE_TIME, 3)
  //we need to check the album page, just after the redirection from album creation, hence this step being in this test
  await photoAlbumPage.checkAlbumPage(data.ALBUM_DATE_TIME, 3)
  console.groupEnd()
})

test('Go into Album view, and share this album using', async () => {
  console.group('↳ ℹ️  Go into Album view, and share this album using')
  await photosCommons.goToAlbums()
  await photoAlbumsPage.goToAlbum(data.ALBUM_DATE_TIME)
  await photoAlbumPage.shareAlbumPublicLink()

  const link = await photoAlbumPage.copyBtnShareByLink.getAttribute(
    'data-test-url'
  )
  if (link) {
    data.sharingLink = link
    console.log(`data.sharingLink : ` + data.sharingLink)
  }
  console.groupEnd()
})

//************************
// Public (no authentification)
//************************
fixture`Photos : Access an album public link, download the file(s), and check the 'create Cozy' link`
  .page`${TESTCAFE_PHOTOS_URL}/`
  .beforeEach(async t => {
    console.group(
      `\n↳ ℹ️  no Loggin (anonymous) & DOWNLOAD_PATH initialization`
    )
    await t.useRole(Role.anonymous())
    await setDownloadPath(data.DOWNLOAD_PATH)
    console.groupEnd()
  })
  .afterEach(async () => {
    await checkLocalFile(
      `${data.DOWNLOAD_PATH}/${data.ALBUM_DATE_TIME.toLowerCase()}.zip`
    )
    await deleteLocalFile(
      `${data.DOWNLOAD_PATH}/${data.ALBUM_DATE_TIME.toLowerCase()}.zip`
    )
  })

test(`[Desktop] Photos : Access an album public link, check the viewer, download the file(s), and check the 'create Cozy' link`, async t => {
  console.group(
    `↳ ℹ️  [Desktop] Photos : Access an album public link, check the viewer, download the file(s), and check the 'create Cozy' link`
  )
  await t.navigateTo(data.sharingLink)
  await publicAlbumPage.waitForLoading()
  await publicAlbumPage.checkActionMenuAlbumDesktop()
  //TODO --> Check viewer https://trello.com/c/u5Uyeu31/1689-photos-visionneuse-album-photos-vue-publique
  await t
    .wait(3000) //!FIXME to remove after https://trello.com/c/IZfev6F1/1658-drive-public-share-impossible-de-t%C3%A9l%C3%A9charger-le-fichier is fixed
    .setNativeDialogHandler(() => true)
    .click(publicAlbumPage.btnPublicDownload)
    .click(publicAlbumPage.btnPublicCreateCozy)
  await publicAlbumPage.checkCreateCozy()
  console.groupEnd()
})

test(`[Mobile] Photos : Access an album public link, check the viewer, download the file(s), and check the 'create Cozy' link`, async t => {
  console.group(
    `↳ ℹ️  [Mobile] Photos : Access an album public link, check the viewer, download the file(s), and check the 'create Cozy' link`
  )
  //Just download for now. button check after  https://trello.com/c/qwbIUoRk/1638-partage-par-lien-vue-publique-boutons-vs-liens)
  await t.resizeWindowToFitDevice('iPhone 6', {
    portraitOrientation: true
  })
  await t.navigateTo(data.sharingLink)
  await publicAlbumPage.waitForLoading()
  await publicAlbumPage.checkActionMenuAlbumMobile()
  //TODO --> Check viewer https://trello.com/c/u5Uyeu31/1689-photos-visionneuse-album-photos-vue-publique
  await t
    .wait(3000) //!FIXME to remove after https://trello.com/c/IZfev6F1/1658-drive-public-share-impossible-de-t%C3%A9l%C3%A9charger-le-fichier is fixed
    .setNativeDialogHandler(() => true)
    .click(publicAlbumPage.btnMoreButton)
    .click(publicAlbumPage.btnPublicDownloadMobile)
    .click(publicAlbumPage.btnMoreButton)
    .click(publicAlbumPage.btnPublicCreacteCozyMobile)
  await publicAlbumPage.checkCreateCozy()

  await t.maximizeWindow() //Back to desktop
  console.groupEnd()
})

//************************
//Tests when authentified
//************************
fixture`Album : Unshare public Link`.page`${TESTCAFE_PHOTOS_URL}/`.beforeEach(
  async t => {
    console.group(`\n↳ ℹ️  Loggin & Initialization`)
    await t.useRole(photosUser)
    await timelinePage.waitForLoading()
    await timelinePage.initPhotosCount()
    console.groupEnd()
  }
)

test('Unshare Album', async () => {
  console.group('↳ ℹ️  Unshare Album')
  await photosCommons.goToAlbums()
  await photoAlbumsPage.goToAlbum(data.ALBUM_DATE_TIME)
  await photoAlbumPage.unshareAlbumPublicLink()
  console.groupEnd()
})

//************************
// Public (no authentification)
//************************
fixture`Photos : No Access to an old album public link`
  .page`${TESTCAFE_PHOTOS_URL}/`.beforeEach(async t => {
  console.group(`\n↳ ℹ️  no Loggin (anonymous)`)
  await t.useRole(Role.anonymous())
  console.groupEnd()
})

test('No Access to an old album public link', async t => {
  console.group('↳ ℹ️  No Access to an old album public link')
  await t.navigateTo(data.sharingLink)
  await publicAlbumPage.waitForLoading()
  await publicAlbumPage.checkNotAvailable()
  console.groupEnd()
})

//************************
//Tests when authentified
//************************
fixture`Test clean up : delete album`.page`${TESTCAFE_PHOTOS_URL}/`.beforeEach(
  async t => {
    console.group(`\n↳ ℹ️  Loggin & Initialization`)
    await t.useRole(photosUser)
    await timelinePage.waitForLoading()
    await timelinePage.initPhotosCount()
    console.groupEnd()
  }
)

test('Go to ALBUM_DATE_TIME, and delete it', async () => {
  console.group(`↳ ℹ️  Go to ${data.ALBUM_DATE_TIME}, and delete it`)
  await photosCommons.goToAlbums()
  await photoAlbumsPage.goToAlbum(`${data.ALBUM_DATE_TIME}`)
  await photoAlbumPage.deleteAlbum()
  await photoAlbumPage.waitForLoading()
  await photoAlbumsPage.checkEmptyAlbum() //There is no more album
  console.groupEnd()
})
