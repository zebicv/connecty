class Post {
  post_id = '';
  post_content = '';
  user_id = '';
  likes = '';
  liked_by = [];
  date = '';
  username = '';
  api_url = 'https://6420c09025cb6572104edd07.mockapi.io';

  checkAllPostsEmpty() {
    const allPosts = document.querySelector('.all_posts');
    const numberOfPosts = allPosts.childElementCount;
    const isPost = allPosts.firstElementChild.classList.contains('single_post');

    if (numberOfPosts === 1 && !isPost) {
      allPosts.innerHTML = '';
    } else if (numberOfPosts === 0) {
      this.displayNoPostsMessage('No posts yet.');
    } else {
      return;
    }
  }

  async createPost(sessionId) {
    // Check if there is any post input from user
    if (this.post_content === '') return;

    this.checkAllPostsEmpty();

    // Create post in database
    let data = {
      content: this.post_content,
      user_id: sessionId,
      likes: 0,
      liked_by: [],
      date: this.date,
      username: this.username,
    };

    data = JSON.stringify(data);

    const response = await fetch(`${this.api_url}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });

    data = await response.json();

    // Render a single post in the DOM
    this.generateMarkup(data);
  }

  async generateMarkup(data) {
    const user = new User();
    const currentUser = await user.getUser(sessionId);

    const html = `
          <div class="single_post" data-post_id="${data.id}">
            <div class="post_info">
              <img class="post_img" src="img/profile.jpg" />
              <div class="post_details">
                <p class="post_username">${currentUser.username}</p>
                <p class="post_date">${data.date}</p>
              </div>
            </div>

            <div class="post_content">
              <p>
                ${data.content}
              </p>
            </div>

            <div class="total_likes">
              <span class="num_likes">${data.likes}</span>
              <span>Likes</span>
            </div>

            <div class="post_buttons">
              <button class="post_btn post_like_btn" onclick="likePost(this)">
                <ion-icon name="heart-outline"></ion-icon>
                <span>Like</span>
              </button>
              <button class="post_btn post_comment_btn" onclick="showComments(this)">
                <ion-icon name="chatbox-outline"></ion-icon>
                <span>Comment</span>
              </button>
            </div>
            <button class="post_remove_btn" onclick="removeMyPost(this)">&times;</button>

            <div class="comments_wrapper">
              <hr />
              <div class="post_comment">
                <form id="post_comment_form">
                  <input
                    class="post_comment_input"
                    type="text"
                    placeholder="Comment something..."
                  />
                  <button class="add_comment_btn">Post comment</button>
                </form>
              </div>
            </div>
          </div>`;

    allPostsWrapper.insertAdjacentHTML('afterbegin', html);
  }

  async updateLikes() {
    let data = {
      likes: this.likes,
      liked_by: this.liked_by,
    };

    data = JSON.stringify(data);

    const response = await fetch(`${this.api_url}/posts/${this.post_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    }).then(res => res.json());

    return response;
  }

  displayLoader() {
    const allPostsDiv = document.querySelector('.all_posts');
    allPostsDiv.innerHTML = '<div class="loader"></div>';
  }

  displayNoPostsMessage(errorMsg) {
    const allPostsDiv = document.querySelector('.all_posts');
    allPostsDiv.innerHTML = `
    <div class="error_load_posts">
        <ion-icon size="large" name="sad-outline"></ion-icon>
        <p>${errorMsg}</p>
      </div>`;
  }

  displayErrorMessage(error) {
    const allPostsDiv = document.querySelector('.all_posts');
    allPostsDiv.innerHTML = `
      <div class="error_load_posts">
        <ion-icon size="large" name="warning-outline"></ion-icon>
        <p>${error.message}</p>
      </div>
    `;
  }

  async getPost(postId) {
    const response = await fetch(`${this.api_url}/posts/${postId}`);
    const data = await response.json();

    return data;
  }

  async getAllPosts() {
    try {
      const response = await fetch(`${this.api_url}/posts`);

      if (!response.ok)
        throw new Error(`An error occurred! Please reload the page.`);

      const data = await response.json();
      return data;
    } catch (error) {
      this.displayErrorMessage(error);
    }
  }

  async loadAllPosts(sessionId, data) {
    const allPostsDiv = document.querySelector('.all_posts');

    if (data.length === 0) {
      this.displayNoPostsMessage('No posts yet.');
    } else {
      allPostsDiv.innerHTML = '';
    }

    data.forEach(post => {
      async function loadPost() {
        // 1) User that made a post
        const { user_id } = post;
        const author = new User();
        const authorUser = await author.getUser(user_id);

        // 2) User that is logged in
        const user = new User();
        const currentUser = await user.getUser(sessionId);

        // 3) Displaying remove button on post
        let removeMyPostBtn = '';

        if (currentUser.id === authorUser.id) {
          removeMyPostBtn = `<button class="post_remove_btn" onclick="removeMyPost(this)">&times;</button>`;
        }

        // 4) Displaying all comments for each post
        const comment = new Comment();
        const allComments = await comment.getAllComments();

        let commentsMarkup = '';

        let removeCommentBtn = '';

        allComments.forEach(comment => {
          if (
            currentUser.id === post.user_id ||
            currentUser.id === comment.user_id
          )
            removeCommentBtn = `<button class="btn_comment_delete" onclick="removeMyComment(this)">&times;</button>`;

          if (comment.post_id === post.id) {
            commentsMarkup += `
            <div class="single_comment" data-comment_id="${comment.id}">
              <p class="comment_author">${comment.username}</p>
              <p class="comment_date">${comment.date}</p>
              <p class="comment_content">
                ${comment.content}
              </p>
              ${removeCommentBtn}
            </div>
          `;
          }

          removeCommentBtn = '';
        });

        // 5) Rendering HTML into the DOM

        const likedPost = post.liked_by.some(el => el === currentUser.id)
          ? 'liked_post'
          : '';

        const html = `
          <div class="single_post" data-post_id="${post.id}">
              <div class="post_info">
                <img class="post_img" src="img/profile.jpg" />
                <div class="post_details">
                  <p class="post_username">${authorUser.username}</p>
                  <p class="post_date">${post.date}</p>
                </div>
              </div>

              <div class="post_content">
                <p>
                  ${post.content}
                </p>
              </div>

              <div class="total_likes">
                <span class="num_likes">${post.likes}</span>
                <span>Likes</span>
              </div>

              <div class="post_buttons">
              <button class="post_btn post_like_btn ${likedPost}" onclick="likePost(this)">
                <ion-icon name="heart-outline"></ion-icon>
                <span>Like</span>
              </button>
              <button class="post_btn post_comment_btn" onclick="showComments(this)">
                <ion-icon name="chatbox-outline"></ion-icon>
                <span>Comment</span>
              </button>
            </div>
              ${removeMyPostBtn}

              <div class="comments_wrapper">
                <hr />
                <div class="post_comment">
                  <form id="post_comment_form">
                    <input
                      class="post_comment_input"
                      type="text"
                      placeholder="Comment something..."
                    />
                    <button class="add_comment_btn">Post comment</button>
                  </form>
                </div>
                ${commentsMarkup}
              </div>
          </div>
        `;

        allPostsWrapper.insertAdjacentHTML('afterbegin', html);
      }
      loadPost();
    });
  }

  deletePost(post_id) {
    const response = fetch(`${this.api_url}/posts/${post_id}`, {
      method: 'DELETE',
    }).then(res => {
      if (res.ok) {
        return res.json();
      }
    });
  }
}
