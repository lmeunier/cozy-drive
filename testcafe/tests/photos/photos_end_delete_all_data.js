import { photosUser } from '../helpers/roles'
import { TESTCAFE_PHOTOS_URL } from '../helpers/utils'

import { IMG0, IMG1, IMG2, IMG3, IMG4 } from '../helpers/data'
import { VisualReviewTestcafe } from '../helpers/visualreview-utils'

const timelinePage = new TimelinePage()
const commons = new Commons()

fixture`Delete all photos`.page`${TESTCAFE_PHOTOS_URL}/`
  .beforeEach(async t => {
    console.group(`\n↳ ℹ️  Loggin & Initialization`)
    await t.useRole(photosUser)
    await timelinePage.waitForLoading()
    await timelinePage.initPhotosCount()
    console.groupEnd()
  })
  .afterEach(async () => {
    console.groupEnd()
  })

test('Deleting 1st pic on Timeline : Open up a modal, and confirm', async () => {
  console.group(
    '↳ ℹ️  Deleting 1st pic on Timeline : Open up a modal, and confirm'
  )
  await commons.selectPhotos(1)
  //pic is removed
  await timelinePage.deletePhotos(1)
})

test('Deleting the 1st 4 pics on Timeline : Open up a modal, and confirm', async () => {
  console.group(
    '↳ ℹ️  Deleting the 1st 4 pics on Timeline : Open up a modal, and confirm'
  )
  await commons.selectPhotos(4)
  //pics are removed, there are no more pictures on  page
  await timelinePage.deletePhotos(4, true)
})
