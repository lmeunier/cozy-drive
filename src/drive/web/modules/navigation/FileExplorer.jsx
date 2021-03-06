import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { translate } from 'cozy-ui/react/I18n'
import SharingProvider from 'sharing'
import RealtimeFiles from './RealtimeFiles'
import {
  openFolder,
  getOpenedFolderId,
  fetchRecentFiles,
  fetchMoreFiles,
  getFolderIdFromRoute,
  getVisibleFiles,
  getFolderUrl
} from 'drive/web/modules/navigation/duck'
import { openLocalFile } from 'drive/mobile/modules/offline/duck'

const isRecentFilesView = props => props.location.pathname.match(/^\/recent/)
const isSharingsFilesView = props =>
  props.location.pathname.match(/^\/sharings/) && !props.params.folderId

const urlHasChanged = (props, newProps) =>
  props.location.pathname !== newProps.location.pathname

const isUrlMatchingOpenedFolder = (props, openedFolderId) =>
  openedFolderId &&
  openedFolderId === getFolderIdFromRoute(props.location, props.params)

class FileExplorer extends Component {
  componentWillMount() {
    if (isRecentFilesView(this.props)) {
      this.props.fetchRecentFiles()
    } else if (isSharingsFilesView(this.props)) {
      // Do nothing — the fetching will be started by a sub-component
    } else {
      this.props.fetchFolder(
        getFolderIdFromRoute(this.props.location, this.props.params)
      )
    }
  }

  componentWillReceiveProps(newProps) {
    if (
      urlHasChanged(this.props, newProps) &&
      !isRecentFilesView(newProps) &&
      !isSharingsFilesView(newProps) &&
      !isUrlMatchingOpenedFolder(newProps, this.props.openedFolderId)
    ) {
      this.navigateToFolder(
        getFolderIdFromRoute(newProps.location, newProps.params)
      )
    } else if (
      urlHasChanged(this.props, newProps) &&
      isRecentFilesView(newProps)
    ) {
      this.props.fetchRecentFiles()
    }
  }

  navigateToFolder = async folderId => {
    await this.props.fetchFolder(folderId)
    this.props.router.push(getFolderUrl(folderId, this.props.location))
  }

  render() {
    const { children, ...otherProps } = this.props
    return (
      <RealtimeFiles>
        <SharingProvider doctype="io.cozy.files" documentType="Files">
          {React.cloneElement(React.Children.only(children), {
            ...otherProps,
            onFolderOpen: this.navigateToFolder
          })}
        </SharingProvider>
      </RealtimeFiles>
    )
  }
}

const mapStateToProps = state => ({
  displayedFolder: state.view.displayedFolder,
  openedFolderId: getOpenedFolderId(state),
  fileCount: state.view.fileCount,
  files: getVisibleFiles(state)
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchRecentFiles: () => dispatch(fetchRecentFiles()),
  fetchMoreFiles: (folderId, skip, limit) =>
    dispatch(fetchMoreFiles(folderId, skip, limit)),
  fetchFolder: folderId => dispatch(openFolder(folderId)),
  onFileOpen: (file, availableOffline) => {
    if (availableOffline) {
      return dispatch(openLocalFile(file))
    }
    const viewPath = ownProps.location.pathname
    ownProps.router.push(`${viewPath}/file/${file.id}`)
  }
})

export default translate()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withRouter(FileExplorer))
)
