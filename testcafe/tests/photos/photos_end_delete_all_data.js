import { photosUser } from '../helpers/roles'
import { TESTCAFE_PHOTOS_URL, SLUG } from '../helpers/utils'
import { VisualReviewTestcafe } from '../helpers/visualreview-utils'
import { IMG0, IMG1, IMG2, IMG3, IMG4 } from '../helpers/data'

import TimelinePage from '../pages/photos-timeline-model'
import Commons from '../pages/photos-commons'

const timelinePage = new TimelinePage()
const commons = new Commons()

fixture`Delete all photos`.page`${TESTCAFE_PHOTOS_URL}/`
  .before(async ctx => {
    ctx.vr = new VisualReviewTestcafe({
      projectName: `${SLUG}`,
      suiteName: `fixture : delete photos`
    })
    await ctx.vr.start()
  })
  .beforeEach(async t => {
    console.group(`\n↳ ℹ️  Loggin & Initialization`)
    await t.useRole(photosUser)
    await timelinePage.waitForLoading()
    await timelinePage.initPhotosCount()
    console.groupEnd()
  })
  .after(async ctx => {
    await ctx.vr.checkRunStatus()
  })

test('Deleting 1st pic on Timeline : Open up a modal, and confirm', async t => {
  console.group(
    `\n↳ ℹ️  Deleting 1 pic on Timeline : Open up a modal, and confirm`
  )
  await commons.selectPhotosByName([IMG0])
  await timelinePage.deletePhotos(1)

  await t.fixtureCtx.vr.takeScreenshotAndUpload('DeleteImage/delete-1-pic')
  console.groupEnd()
})

test('Deleting 4 pics on Timeline : Open up a modal, and confirm', async t => {
  console.group(
    `\n↳ ℹ️  Deleting 4 pics on Timeline : Open up a modal, and confirm`
  )
  await commons.selectPhotosByName([IMG1, IMG2, IMG3, IMG4])
  //pics are removed, there are no more pictures on  page
  await timelinePage.deletePhotos(4, true)

  await t.fixtureCtx.vr.takeScreenshotAndUpload('DeleteImage/delete-4-pics')
  console.groupEnd()
})
