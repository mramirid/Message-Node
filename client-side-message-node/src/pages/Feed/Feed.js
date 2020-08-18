import React, { Component, Fragment } from 'react'

import Post from '../../components/Feed/Post/Post'
import Button from '../../components/Button/Button'
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit'
import Input from '../../components/Form/Input/Input'
import Paginator from '../../components/Paginator/Paginator'
import Loader from '../../components/Loader/Loader'
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler'
import './Feed.css'
import post from '../../components/Feed/Post/Post'

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  }

  async componentDidMount() {
    try {
      const graphqlQuery = {
        query: `
          {
            user {
              status
            }
          }
        `
      }
      const res = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.props.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphqlQuery)
      })

      const resData = await res.json()
      if (resData.errors) {
        throw new Error('Could not fetch user status')
      }
      console.log(resData)
      this.setState({ status: resData.data.user.status })

    } catch (error) {
      this.catchError(error)
    }

    this.loadPosts()
  }

  loadPosts = async direction => {
    if (direction) this.setState({ postsLoading: true, posts: [] })
    let page = this.state.postPage
    if (direction === 'next') {
      page++
      this.setState({ postPage: page })
    }
    if (direction === 'previous') {
      page--
      this.setState({ postPage: page })
    }

    const graphqlQuery = {
      query: `
        {
          posts(page: ${page}) {
            posts {
              _id
              title
              content
              imageUrl
              creator {
                name
              }
              createdAt
            }
            totalPosts
          }
        }
      `
    }

    try {
      const res = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.props.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphqlQuery)
      })
      if (res.status !== 200) {
        throw new Error('Failed to fetch posts.')
      }

      const resData = await res.json()
      console.log('Posts:', resData)
      this.setState({
        posts: resData.data.posts.posts.map(post => {
          return {
            ...post,
            imagePath: post.imageUrl
          }
        }),
        totalPosts: resData.data.posts.totalPosts,
        postsLoading: false
      })

    } catch (error) {
      this.catchError(error)
    }
  }

  statusUpdateHandler = async event => {
    event.preventDefault()

    try {
      const graphqlQuery = {
        query: `
          mutation {
            updateStatus(status: "${this.state.status}") {
              status
            }
          }
        `
      }
      const res = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.props.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphqlQuery)
      })

      const resData = await res.json()
      if (resData.errors) {
        throw new Error('Fetching user status failed')
      }
      console.log(resData)

    } catch (error) {
      this.catchError(error)
    }
  }

  newPostHandler = () => {
    this.setState({ isEditing: true })
  }

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = { ...prevState.posts.find(p => p._id === postId) }

      return {
        isEditing: true,
        editPost: loadedPost
      }
    })
  }

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null })
  }

  finishEditHandler = async postData => {
    this.setState({
      editLoading: true
    })

    const formData = new FormData()
    formData.append('image', postData.image)
    if (this.state.editPost) {
      formData.append('oldPath', this.state.editPost.imagePath)
    }

    try {
      const imgUploadRes = await fetch('http://localhost:8080/post-image', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${this.props.token}` },
        body: formData
      })
      if (imgUploadRes.status === 401 || imgUploadRes.status === 500) {
        throw new Error('Could not upload image')
      }

      const imgUploadResData = await imgUploadRes.json()
      const imageUrl = imgUploadResData.newFilePath || this.state.editPost.imagePath
      if (this.state.editPost) {
        var graphqlQuery = {
          query: `
            mutation {
              updatePost(
                id: "${this.state.editPost._id}",
                postInput: {
                  title: "${postData.title}", 
                  content: "${postData.content}", 
                  imageUrl: "${imageUrl}"
                }
              ) {
                _id
                title
                content
                imageUrl
                creator {
                  name
                }
                createdAt
              }
            }
          `
        }
      } else {
        var graphqlQuery = {
          query: `
            mutation {
              createPost(
                postInput: {
                  title: "${postData.title}", 
                  content: "${postData.content}", 
                  imageUrl: "${imageUrl}"
                }
              ) {
                _id
                title
                content
                imageUrl
                creator {
                  name
                }
                createdAt
              }
            }
          `
        }
      }

      const res = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.props.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphqlQuery)
      })

      const resData = await res.json()
      if (resData.errors && resData.errors[0].statusCode === 422) {
        throw new Error('Validation failed.')
      }
      if (resData.errors) {
        throw new Error(this.state.editPost ? 'Could not update post' : 'Could not create post')
      }
      console.log('Edit post:', resData)

      const resDataField = this.state.editPost ? 'updatePost' : 'createPost'
      const post = {
        _id: resData.data[resDataField]._id,
        title: resData.data[resDataField].title,
        content: resData.data[resDataField].content,
        imagePath: resData.data[resDataField].imageUrl,
        creator: resData.data[resDataField].creator.name,
        createdAt: resData.data[resDataField].createdAt
      }

      this.setState(prevState => {
        let updatedPosts = [...prevState.posts]

        if (prevState.editPost) {
          const postIndex = prevState.posts.findIndex(
            p => p._id === prevState.editPost._id
          )
          updatedPosts[postIndex] = post
        } else {
          if (prevState.posts.length >= 2) {
            updatedPosts.pop();
          }
          updatedPosts.unshift(post)
        }

        return {
          posts: updatedPosts,
          isEditing: false,
          editPost: null,
          editLoading: false
        }
      })

    } catch (err) {
      console.log(err)
      this.setState({
        isEditing: false,
        editPost: null,
        editLoading: false,
        error: err
      })
    }
  }

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value })
  }

  deletePostHandler = async postId => {
    this.setState({ postsLoading: true })

    const graphqlQuery = {
      query: `
        mutation {
          deletePost(id: "${postId}")
        }
      `
    }

    try {
      const res = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.props.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphqlQuery)
      })

      const resData = await res.json()
      if (resData.errors) {
        throw new Error('Could not delete post')
      }
      console.log('Delete post:', resData)
      this.loadPosts()

    } catch (err) {
      console.log(err)
      this.setState({ postsLoading: false })
    }
  }

  errorHandler = () => {
    this.setState({ error: null })
  }

  catchError = error => {
    this.setState({ error: error })
  }

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map(post => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString('en-US')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    )
  }
}

export default Feed
