import { photosUser } from '../helpers/roles' //import roles for login
import { TESTCAFE_PHOTOS_URL } from '../helpers/utils'
import random from 'lodash/random'
import TimelinePage from '../pages/photos-timeline-model'
import Commons from '../pages/photos-commons'

const timelinePage = new TimelinePage()
const commons = new Commons()

fixture`PHOTOS - CRUD`.page`${TESTCAFE_PHOTOS_URL}/`.beforeEach(async t => {
  console.group(`\n↳ ℹ️  Loggin & Initialization`)
  await t.useRole(photosUser)
  await timelinePage.waitForLoading()
  await timelinePage.initPhotosCount()
  console.groupEnd()
})

test('Select 1 pic from Photos view', async () => {
  console.group('↳ ℹ️  Select 1 pic from Photos view')
  //Selection bar shows up. It includes AddtoAlbun, Download and Delete buttons
  await commons.selectPhotos(1)
  await timelinePage.checkPhotobar()
  console.groupEnd()
})

test('Select 3 pic from Photos view', async () => {
  console.group('↳ ℹ️  Select 3 pic from Photos view')
  //Selection bar shows up. It includes AddtoAlbun, Download and Delete buttons
  await commons.selectPhotos(3)
  await timelinePage.checkPhotobar()
  console.groupEnd()
})

test('Open 1st pic', async () => {
  console.group('↳ ℹ️  Open 1st pic')
  //Right arrow shows up. Navigatio to other pics is OK, Closing pic (X or 'esc') is Ok
  await timelinePage.openPhotoFullscreen(0)
  await timelinePage.navigateToNextPhoto(0)
  await timelinePage.closePhotoFullscreenX()

  await timelinePage.openPhotoFullscreen(0)
  await timelinePage.navigateToPrevPhoto(0)
  await timelinePage.closePhotoFullscreenEsc()
  console.groupEnd()
})

test('Open Last pic', async t => {
  console.group('↳ ℹ️  Open Last pic')
  //Left arrow shows up. Navigatio to other pics is OK, Closing pic (X or 'esc') is Ok
  await timelinePage.openPhotoFullscreen(t.ctx.allPhotosStartCount - 1)
  await timelinePage.navigateToNextPhoto(t.ctx.allPhotosStartCount - 1)
  await timelinePage.closePhotoFullscreenX()

  await timelinePage.openPhotoFullscreen(t.ctx.allPhotosStartCount - 1)
  await timelinePage.navigateToPrevPhoto(t.ctx.allPhotosStartCount - 1)
  await timelinePage.closePhotoFullscreenEsc()
  console.groupEnd()
})

test('Open a random pic (not first nor last)', async t => {
  console.group('↳ ℹ️  Open a random pic (not first nor last)')
  //Both arrows show up. Navigatio to other pics is OK, Closing pic (X or 'esc') is Ok
  // We need at least 3 pics in our cozy for this test to pass
  const photoIndex = random(1, t.ctx.allPhotosStartCount - 2)

  console.log('Open random pic  > photoIndex ' + photoIndex)
  await timelinePage.openPhotoFullscreen(photoIndex)
  await timelinePage.navigateToNextPhoto(photoIndex)
  await timelinePage.closePhotoFullscreenX()

  await timelinePage.openPhotoFullscreen(photoIndex)
  await timelinePage.navigateToPrevPhoto(photoIndex)
  console.groupEnd()
})
