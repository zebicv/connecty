//////////// PROFILE INFORMATION /////////////////
const containerRight = document.querySelector('.container_right');
const profileUsername = document.querySelector('.profile_username');
const profileEmail = document.querySelector('.profile_email');
const logoutBtn = document.querySelector('.btn_logout');
const btnEditProfile = document.querySelector('.btn_edit');
const overlay = document.querySelector('.overlay');
//////////// MODAL WINDOW - EDIT PROFILE /////////////////
const modal = document.querySelector('.modal');
const modalForm = document.querySelector('#edit_profile_form');
const closeModalBtn = document.querySelector('.close_modal');
const editUsername = document.querySelector('#edit_username');
const editEmail = document.querySelector('#edit_email');
const saveChangesBtn = document.querySelector('.btn_save_changes');
const discardChangesBtn = document.querySelector('.btn_discard_changes');
//////////// POST CONTENT /////////////////
const postForm = document.querySelector('#post_form');
const postInput = document.querySelector('.post_content_input');
const postBtn = document.querySelector('.btn_post');
const singlePost = document.querySelector('.single_post');
//////////// POSTS AND COMMENTS /////////////////
const allPostsWrapper = document.querySelector('.all_posts');
const commentsWrapper = document.querySelector('.comments_wrapper');
const postCommentBtn = document.querySelector('.post_comment_btn');
const postCommentForm = document.querySelector('.post_comment_form');
const commentInput = document.querySelector('.post_comment_input');
const deleteCommentBtn = document.querySelector('.btn_comment_delete');
//////////// FILTER BUTTONS /////////////////
const showMyPostsBtn = document.querySelector('.show_my_posts');
const showAllPostsBtn = document.querySelector('.show_all_posts');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let sessionId;

// GET CURRENT USER
const session = new Session();
sessionId = session.getSession().replace('=', '');

if (sessionId === '') window.location.href = 'index.html';
if (sessionId !== '') {
  async function fillUserData() {
    const user = new User();
    const currentUser = await user.getUser(sessionId);

    // FILL PROFILE INFORMATION
    profileEmail.innerText = currentUser.email;
    profileUsername.innerText = currentUser.username;

    // FILL EDIT PROFILE MODAL
    editUsername.value = currentUser.username;
    editEmail.value = currentUser.email;
  }

  fillUserData();
}

//////////// FETCH AND LOAD ALL POSTS WHEN THE APPLICATION STARTS /////////////////
const fetchAllPosts = async function () {
  const post = new Post();
  post.displayLoader();
  const allPostsArr = await post.getAllPosts();
  post.loadAllPosts(sessionId, allPostsArr);
};
fetchAllPosts();

//////////// SHOW ALL POSTS BUTTON /////////////////
showAllPostsBtn.addEventListener('click', fetchAllPosts);

//////////// SHOW MY POSTS BUTTON /////////////////
const handlerShowMyPosts = async function (e) {
  // SHOW MY POSTS BUTTON
  const btn = e.target;

  // GET ALL POSTS
  const post = new Post();
  const allPosts = await post.getAllPosts();
  const usersPosts = [];

  allPostsWrapper.innerHTML = '';

  if (!allPosts.some(singlePost => singlePost.user_id === sessionId))
    allPostsWrapper.innerHTML = `
    <div  class="no_posts_message">
      <p>You haven't posted anything yet! :(</p>
    </div>`;

  allPosts.forEach(singlePost => {
    if (singlePost.user_id === sessionId) usersPosts.push(singlePost);
  });

  post.displayLoader();
  post.loadAllPosts(sessionId, usersPosts);
};

showMyPostsBtn.addEventListener('click', handlerShowMyPosts);

//////////// TEXT AREA MANIPULATION /////////////////
window.addEventListener('load', async function (e) {
  e.preventDefault();

  const user = new User();
  const currentUser = await user.getUser(sessionId);

  postInput.setAttribute(
    'placeholder',
    `What's on your mind, ${currentUser.username}?`
  );
});

//////////// MODAL WINDOW MANIPULATION /////////////////
const closeModal = function () {
  modal.style.display = 'none';
  modal.classList.remove('animated');
  overlay.style.display = 'none';
};

const openModal = function () {
  modal.style.display = 'block';
  overlay.style.display = 'block';
  modal.classList.add('animated');
};

btnEditProfile.addEventListener('click', openModal);
discardChangesBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

//////////// LOGOUT BUTTON /////////////////
logoutBtn.addEventListener('click', function (e) {
  let session = new Session();
  session.endSession();

  window.location.href = 'index.html';
});

//////////// EDIT PROFILE - SAVE CHANGES /////////////////

modalForm.addEventListener('submit', function (e) {
  e.preventDefault();

  async function checkUsers() {
    // TAKING INPUT VALUES
    const newUsername = editUsername.value;
    const newEmail = editEmail.value;

    // CHECKING EXISTING USERS
    const user = new User();
    user.username = newUsername;
    user.email = newEmail;

    // CURRENT USER
    const currentUser = await user.getUser(sessionId);
    const currentUserId = currentUser.id;

    const checkResult = await user.checkAllUsers(
      currentUserId,
      editEmail,
      editUsername
    );

    if (!checkResult) {
      // SENDING PUT REQUEST
      user.editUser(sessionId);

      // SETTING NEW USERNAME & EMAIL IN THE DOM
      profileUsername.innerText = user.username;
      profileEmail.innerText = user.email;
    }
  }
  checkUsers();
});

//////////// CLEAR ERROR MESSAGE BELOW INPUT FIELD - MODAL /////////////////
const clearErrorMsg = function (input) {
  input.nextElementSibling.innerText = '';
};

//////////// SAVE CHANGES BUTTON VALIDATION /////////////////
let isEditUsernameValid = true;
let isEditEmailValid = true;
const isSaveBtnValid = function () {
  if (isEditUsernameValid && isEditEmailValid) {
    saveChangesBtn.removeAttribute('disabled');
  } else {
    saveChangesBtn.setAttribute('disabled', 'true');
  }
};

editUsername.addEventListener('input', function () {
  isEditUsernameValid = editUsername.value.length >= 5 ? true : false;
  isSaveBtnValid();
});

editEmail.addEventListener('input', function () {
  const emailValue = editEmail.value;

  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailValue)) {
    isEditEmailValid = true;
  } else {
    isEditEmailValid = false;
  }

  isSaveBtnValid();
});

//////////// DELETE POSTS & COMMENTS SEQUENTIALLY /////////////////

const deleteCommentsSequentially = function (data) {
  let i = 0;
  const intervalId = setInterval(() => {
    if (i >= data.length) {
      clearInterval(intervalId);
      return;
    }
    const item = data[i];
    const comment = new Comment();
    comment.deleteComment(item.id);
    i++;
  }, 150);
};

const deletePostsSequentially = function (data) {
  let i = 0;
  const intervalId = setInterval(() => {
    if (i >= data.length) {
      clearInterval(intervalId);
      return;
    }
    const item = data[i];
    const post = new Post();
    post.deletePost(item.id);
    i++;
  }, 1000);
};

//////////// ADD POSTS /////////////////
postForm.addEventListener('submit', function (e) {
  e.preventDefault();

  async function renderPost() {
    // TAKING INPUT FROM A USER
    const input = postInput.value;
    postInput.value = '';

    // GET USERNAME OF POST CREATOR
    const user = new User();
    const authorPost = await user.getUser(sessionId);

    // Sending POST request and rendering post in the DOM
    const post = new Post();
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'short',
    };

    const locale = navigator.language;

    post.date = new Intl.DateTimeFormat('locale', options).format(now);
    post.post_content = input;
    post.username = authorPost.username;

    post.createPost(sessionId);
  }
  renderPost();
});

//////////// ADD COMMENTS /////////////////
allPostsWrapper.addEventListener('submit', function (e) {
  e.preventDefault();

  async function commentRender() {
    // 1) GET FORM AND INPUT
    const commentForm = e.target;
    const inputField = commentForm.querySelector('input');
    const inputValue = inputField.value;

    // 2) GET POST ID
    const postEl = e.target.closest('.single_post');
    const postId = postEl.dataset.post_id;
    const commentsContainer = postEl.querySelector('.comments_wrapper');

    // 3) GET USERNAME OF COMMENT CREATOR
    const user = new User();
    const authorComment = await user.getUser(sessionId);

    // 4) CREATE AND FILL NEW COMMENT VARIABLE
    const comment = new Comment();

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'short',
    };

    const locale = navigator.language;

    comment.date = new Intl.DateTimeFormat('locale', options).format(now);

    comment.content = inputValue;
    comment.user_id = sessionId;
    comment.post_id = postId;
    comment.username = authorComment.username;
    inputField.value = '';

    // 5) CALLING createComment Fn AND INSERTING COMMENT IN THE DOM
    const newComment = await comment.createComment();

    const newCommentMarkup = `
      <div class="single_comment" data-comment_id="${newComment.id}">
        <p class="comment_author">${newComment.username}</p>
        <p class="comment_date">${newComment.date}</p>
        <p class="comment_content">
         ${newComment.content}
        </p>
        <button class="btn_comment_delete" onclick="removeMyComment(this)">&times;</button>
      </div>
    `;

    commentsContainer.insertAdjacentHTML('beforeend', newCommentMarkup);
  }
  commentRender();
});

//////////// DELETE COMMENT /////////////////
const removeMyComment = function (btn) {
  // SINGLE POST CONTAINER
  const singleComment = btn.closest('.single_comment');
  const singleCommentId = singleComment.dataset.comment_id;

  // CALL DELETE COMMENT FUNCTION
  const comment = new Comment();
  comment.deleteComment(singleCommentId);

  // DELETE COMMENT FROM THE DOM
  singleComment.remove();
};

//////////// DELETE POST /////////////////
const removeMyPost = async function (btn) {
  // SINGLE POST CONTAINER
  const singlePost = btn.closest('.single_post');
  const singlePostId = +singlePost.dataset.post_id;

  // CALL DELETE POST FUNCTION
  const post = new Post();
  post.deletePost(singlePostId);

  // DELETE POST FROM DOM
  singlePost.remove();

  // DELETE ALL COMMENTS ON A SINGLE POST
  const comment = new Comment();
  const allComments = await comment.getAllComments();
  const commentsOnPost = allComments
    .filter(singleComm => +singleComm.post_id === +singlePostId)
    .map(comm => {
      return { id: +comm.id };
    });

  deleteCommentsSequentially(commentsOnPost);
};

//////////// SHOW COMMENTS ON POST /////////////////
const showComments = function (btn) {
  // CURRENT POST
  const currentPost = btn.closest('.single_post');
  const currentPostComments = currentPost.querySelector('.comments_wrapper');

  currentPostComments.style.display = 'block';
};

//////////// LIKE POST /////////////////
const likePost = async function (btn) {
  // GET CURRENT USER
  const user = new User();
  const currentUser = await user.getUser(sessionId);

  // CURRENT POST
  const singlePost = btn.closest('.single_post');
  const singlePostId = singlePost.dataset.post_id;
  let singlePostLikes = singlePost.querySelector('.num_likes');
  const singlePostLikeBtn = singlePost.querySelector('.post_like_btn');

  // GET CURRENT POST DATA
  const post = new Post();
  const currentPost = await post.getPost(singlePostId);
  let postLikedBy = currentPost.liked_by;

  // UPDATE NUMBER OF LIKES
  let numberOfLikes = currentPost.likes;

  if (postLikedBy.includes(currentUser.id)) {
    const index = postLikedBy.indexOf(currentUser.id);
    postLikedBy.splice(index, 1);

    numberOfLikes--;
  } else {
    numberOfLikes++;
    postLikedBy.push(currentUser.id);
  }

  post.likes = numberOfLikes;
  post.liked_by = postLikedBy;
  post.post_id = currentPost.id;
  const response = await post.updateLikes();

  // UPDATE THE DOM
  singlePostLikes.innerText = response.likes;

  if (singlePostLikeBtn.classList.contains('liked_post')) {
    singlePostLikeBtn.classList.remove('liked_post');
  } else {
    singlePostLikeBtn.classList.add('liked_post');
  }
};

//////////// SCROLL TO TOP BUTTON /////////////////
const scrollTop = function () {
  // CREATE HTML BUTTON ELEMENT
  const scrollBtn = document.createElement('button');
  scrollBtn.innerHTML = '&uarr;';
  scrollBtn.setAttribute('id', 'scroll-btn');
  document.body.appendChild(scrollBtn);

  // HIDE/SHOW BUTTON BASED ON SCROLL DISTANCE
  const scrollBtnDisplay = function () {
    window.scrollY > window.innerHeight / 2
      ? scrollBtn.classList.add('show')
      : scrollBtn.classList.remove('show');
  };

  window.addEventListener('scroll', scrollBtnDisplay);

  // SCROLL TO TOP WHEN BUTTON IS CLICKED
  const scrollWindow = function () {
    if (window.scrollY != 0) {
      setTimeout(function () {
        window.scrollTo(0, window.scrollY - 50);
        scrollWindow();
      }, 10);
    }
  };
  scrollBtn.addEventListener('click', scrollWindow);
};
scrollTop();
