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
      const res = await fetch('http://localhost:8080/user/status', {
        headers: { Authorization: `Bearer ${this.props.token}` }
      })

      if (res.status !== 200) {
        throw new Error('Failed to fetch user status.')
      }

      const resData = await res.json()
      console.log(resData)
      this.setState({ status: resData.status })

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
      console.log(resData)
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
      const res = await fetch('http://localhost:8080/user/status', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.props.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: this.state.status })
      })

      const resData = await res.json()
      if (resData.errors) {
        throw new Error('Fetching posts failed')
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
    formData.append('title', postData.title)
    formData.append('content', postData.content)
    formData.append('image', postData.image)

    let graphqlQuery = {
      query: `
        mutation {
          createPost(
            postInput: {
              title: "${postData.title}", 
              content: "${postData.content}", 
              imageUrl: "https://i.ytimg.com/vi/IEMUI4VmXjg/maxresdefault.jpg"
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
      if (resData.errors && resData.errors[0].statusCode === 422) {
        throw new Error('Validation failed.')
      }
      if (resData.errors) {
        throw new Error('Could not create post')
      }

      console.log(resData)

      const post = {
        _id: resData.data.createPost._id,
        title: resData.data.createPost.title,
        content: resData.data.createPost.content,
        creator: resData.data.createPost.creator.name,
        createdAt: resData.data.createPost.createdAt
      }

      this.setState(prevState => {
        let updatedPosts = [...prevState.posts]

        if (prevState.editPost) {
          const postIndex = prevState.posts.findIndex(
            p => p._id === prevState.editPost._id
          )
          updatedPosts[postIndex] = post
        } else {
          updatedPosts.pop()
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

    try {
      const res = await fetch(`http://localhost:8080/feed/post/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.props.token}` }
      })

      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Deleting a post failed!')
      }

      const resData = await res.json()
      console.log(resData)
      this.loadPosts()
      // this.setState(prevState => {
      //   const updatedPosts = prevState.posts.filter(p => p._id !== postId)
      //   return { posts: updatedPosts, postsLoading: false }
      // })

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
