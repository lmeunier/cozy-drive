import { Role } from 'testcafe'
import { photosUser } from '../helpers/roles'
import {
  TESTCAFE_PHOTOS_URL,
  SLUG,
  deleteLocalFile,
  checkLocalFile,
  setDownloadPath
} from '../helpers/utils'
import { VisualReviewTestcafe } from '../helpers/visualreview-utils'
import TimelinePage from '../pages/photos-timeline-model'
import AlbumPage from '../pages/photos-album-model'
import AlbumsPage from '../pages/photos-albums-model'
import Commons from '../pages/photos-commons'
import PublicAlbumPage from '../pages/photos-album-model-public'
import PublicViewer from '../pages/photos-vr/public-viewer-model'

const timelinePage = new TimelinePage()
const photoAlbumPage = new AlbumPage()
const photoAlbumsPage = new AlbumsPage()
const photosCommons = new Commons()
const publicAlbumPage = new PublicAlbumPage()
const publicViewer = new PublicViewer()

let data = require('../helpers/data')

//Scenario const
const FEATURE_PREFIX = 'AlbumSharingScenario'

const FIXTURE_INIT = `${FEATURE_PREFIX} 1- Create and Share Album`
const TEST_CREATE_ALBUM = `1-1 Create Album`
const TEST_SHARE_ALBUM = `1-2 Share Album`

const FIXTURE_PUBLIC_WITH_DL = `${FEATURE_PREFIX} 2- Go to public link and download files`
const TEST_PUBLIC_ALBUM_DESKTOP = `2-1 Check public album on desktop`
const TEST_PUBLIC_ALBUM_MOBILE = `2-1 Check public album on mobile`

const FIXTURE_UNSHARE = `${FEATURE_PREFIX} 3- Unshare Album`
const TEST_UNSHARE_ALBUM = `${FEATURE_PREFIX} 3-1 Unshare Album`

const FIXTURE_PUBLIC_NO_ACCESS = `${FEATURE_PREFIX} 4- Go to public link without access`
const TEST_PUBLIC_NO_ACCESS = `4-1 Check no access to old share`

const FIXTURE_CLEANUP = `${FEATURE_PREFIX} 5- Cleanup Data (Remove album)`
const TEST_DELETE_ALBUM = `5-1 Delete Album`

//************************
//Tests when authentified
//************************
fixture`${FIXTURE_INIT}`.page`${TESTCAFE_PHOTOS_URL}/`.beforeEach(async t => {
  console.group(`\n↳ ℹ️  Loggin & Initialization`)
  await t.useRole(photosUser)
  await timelinePage.waitForLoading()
  await timelinePage.initPhotosCount()
  console.groupEnd()
})

test(`${TEST_CREATE_ALBUM}`, async () => {
  console.group(`↳ ℹ️  ${FEATURE_PREFIX} : ${TEST_CREATE_ALBUM}`)
  await photosCommons.goToAlbums()
  await photoAlbumsPage.addNewAlbum(FEATURE_PREFIX, 3)
  //we need to check the album page, just after the redirection from album creation, hence this step being in this test
  await photoAlbumPage.checkAlbumPage(FEATURE_PREFIX, 3)
  console.groupEnd()
})

test(`${TEST_SHARE_ALBUM}`, async () => {
  console.group(`↳ ℹ️  ${FEATURE_PREFIX} : ${TEST_SHARE_ALBUM}`)
  await photosCommons.goToAlbums()
  await photoAlbumsPage.goToAlbum(FEATURE_PREFIX)
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
fixture`${FIXTURE_PUBLIC_WITH_DL}`.page`${TESTCAFE_PHOTOS_URL}/`
  .before(async ctx => {
    ctx.vr = new VisualReviewTestcafe({
      projectName: `${SLUG}`,
      suiteName: `${FIXTURE_PUBLIC_WITH_DL}`
    })
    await ctx.vr.start()
  })
  .beforeEach(async t => {
    console.group(
      `\n↳ ℹ️  no Loggin (anonymous) & DOWNLOAD_PATH initialization`
    )
    await t.useRole(Role.anonymous())
    await setDownloadPath(data.DOWNLOAD_PATH)
    await t.navigateTo(data.sharingLink)
    //Init count for navigation
    t.ctx.totalFilesCount = await photosCommons.getPhotosCount('Before')
    console.groupEnd()
  })
  .afterEach(async () => {
    console.log(
      `↳ ℹ️  ${FEATURE_PREFIX} - Checking downloaded file for ${FEATURE_PREFIX.toLowerCase()}.zip`
    )
    await checkLocalFile(
      `${data.DOWNLOAD_PATH}/${FEATURE_PREFIX.toLowerCase()}.zip`
    )
    await deleteLocalFile(
      `${data.DOWNLOAD_PATH}/${FEATURE_PREFIX.toLowerCase()}.zip`
    )
  })
  .after(async ctx => {
    await ctx.vr.checkRunStatus()
  })

test(`${TEST_PUBLIC_ALBUM_DESKTOP}`, async t => {
  console.group(
    `↳ ℹ️  ${FEATURE_PREFIX} : ${TEST_PUBLIC_ALBUM_DESKTOP} > Access an album public link, check the viewer, download the file(s), and check the 'create Cozy' link`
  )
  await publicAlbumPage.waitForLoading()
  await publicAlbumPage.checkActionMenuAlbumDesktop()

  //Viewer
  await publicViewer.checkPublicImageViewer_vr(
    `${FEATURE_PREFIX}/${TEST_PUBLIC_ALBUM_DESKTOP}-1`,
    0
  )
  await publicViewer.checkViewerNavigation_vr(
    `${FEATURE_PREFIX}/${TEST_PUBLIC_ALBUM_DESKTOP}-2`,
    0,
    3
  )

  await t
    .wait(3000) //!FIXME to remove after https://trello.com/c/IZfev6F1/1658-drive-public-share-impossible-de-t%C3%A9l%C3%A9charger-le-fichier is fixed
    .setNativeDialogHandler(() => true)
    .click(publicAlbumPage.btnPublicDownload)
    .click(publicAlbumPage.btnPublicCreateCozy)
  await publicAlbumPage.checkCreateCozy()
  console.groupEnd()
})

test(`${TEST_PUBLIC_ALBUM_MOBILE}`, async t => {
  console.group(
    `↳ ℹ️  ${FEATURE_PREFIX} : ${TEST_PUBLIC_ALBUM_MOBILE} > Access an album public link, check the viewer, download the file(s), and check the 'create Cozy' link`
  )
  await t.resizeWindowToFitDevice('iPhone 6', {
    portraitOrientation: true
  })
  await t.navigateTo(data.sharingLink)
  await publicAlbumPage.waitForLoading()
  await publicAlbumPage.checkActionMenuAlbumMobile()

  //Viewer
  await publicViewer.checkPublicImageViewer_vr(
    `${FEATURE_PREFIX}/${TEST_PUBLIC_ALBUM_MOBILE}-1`,
    0
  )
  await publicViewer.checkViewerNavigation_vr(
    `${FEATURE_PREFIX}/${TEST_PUBLIC_ALBUM_MOBILE}-2`,
    0,
    3
  )

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
fixture`${FIXTURE_UNSHARE}`.page`${TESTCAFE_PHOTOS_URL}/`.beforeEach(
  async t => {
    console.group(`\n↳ ℹ️  Loggin & Initialization`)
    await t.useRole(photosUser)
    await timelinePage.waitForLoading()
    await timelinePage.initPhotosCount()
    console.groupEnd()
  }
)

test(`${TEST_UNSHARE_ALBUM}`, async () => {
  console.group(`↳ ℹ️  ${FEATURE_PREFIX} : ${TEST_UNSHARE_ALBUM}`)
  await photosCommons.goToAlbums()
  await photoAlbumsPage.goToAlbum(FEATURE_PREFIX)
  await photoAlbumPage.unshareAlbumPublicLink()
  console.groupEnd()
})

//************************
// Public (no authentification)
//************************
fixture`${FIXTURE_PUBLIC_NO_ACCESS}`.page`${TESTCAFE_PHOTOS_URL}/`.beforeEach(
  async t => {
    console.group(`\n↳ ℹ️  no Loggin (anonymous)`)
    await t.useRole(Role.anonymous())
    console.groupEnd()
  }
)

test(`${TEST_PUBLIC_NO_ACCESS}`, async t => {
  console.group(`↳ ℹ️  ${FEATURE_PREFIX} : ${TEST_PUBLIC_NO_ACCESS}`)
  await t.navigateTo(data.sharingLink)
  await publicAlbumPage.waitForLoading()
  await publicAlbumPage.checkNotAvailable()
  console.groupEnd()
})

//************************
//Tests when authentified
//************************
fixture`${FIXTURE_CLEANUP}`.page`${TESTCAFE_PHOTOS_URL}/`.beforeEach(
  async t => {
    console.group(`\n↳ ℹ️  Loggin & Initialization`)
    await t.useRole(photosUser)
    await timelinePage.waitForLoading()
    await timelinePage.initPhotosCount()
    console.groupEnd()
  }
)

test(`${TEST_DELETE_ALBUM}`, async () => {
  console.group(`↳ ℹ️  ${FEATURE_PREFIX} : ${TEST_DELETE_ALBUM}`)
  await photosCommons.goToAlbums()
  await photoAlbumsPage.goToAlbum(`${FEATURE_PREFIX}`)
  await photoAlbumPage.deleteAlbum()
  await photoAlbumPage.waitForLoading()
  await photoAlbumsPage.checkEmptyAlbum() //There is no more album
  console.groupEnd()
})
