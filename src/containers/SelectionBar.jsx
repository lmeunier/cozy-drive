import styles from '../styles/selectionbar'

import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import classNames from 'classnames'
import { translate } from '../lib/I18n'

import Alerter from '../components/Alerter'
import { hideSelectionBar } from '../actions/selection'

import { addToAlbum, removeFromAlbum, getCurrentAlbum } from '../ducks/albums'

const SelectionBar = ({ t, selected, selectedCount, album, onHide, onAddToAlbum, onRemoveFromAlbum, router }) => (
  <div
    className={classNames(styles['coz-selectionbar'], {
      [styles['coz-selectionbar--active']]: selectedCount !== 0
    })}
    role='toolbar'
  >
    <span className={styles['coz-selectionbar-count']}>
      {t('SelectionBar.selected_count', { smart_count: selectedCount })}
    </span>
    <span className={styles['coz-selectionbar-separator']} />
    <button
      disabled={selectedCount === 0}
      className={styles['pho-action-album-add']}
      onClick={() => onAddToAlbum(selected)}
    >
      {t('SelectionBar.add_to_album')}
    </button>
    {router.location.pathname.startsWith('/albums') &&
    <button
      disabled={selectedCount === 0}
      className={styles['pho-action-album-remove']}
      onClick={() => onRemoveFromAlbum(selected, album)}
    >
      {t('SelectionBar.remove_from_album')}
    </button>
    }
    <button className={styles['coz-action-close']} onClick={onHide}>
      {t('SelectionBar.close')}
    </button>
  </div>
)

const mapStateToProps = (state, ownProps) => ({
  selected: state.ui.selected,
  selectedCount: state.ui.selected.length,
  album: getCurrentAlbum(state.albums)
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  onHide: () => dispatch(hideSelectionBar()),
  onAddToAlbum: selected => dispatch(addToAlbum(selected)),
  onRemoveFromAlbum: (selected, album) =>
  dispatch(removeFromAlbum(selected, album))
  .catch(err => Alerter.error((err.message)))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(withRouter(SelectionBar)))
