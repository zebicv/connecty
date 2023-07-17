const session = new Session();
const sessionId = session.getSession().replace('=', '');

if (sessionId !== '') window.location.href = 'connecty.html';

//////////// MODAL WINDOW ELEMENTS /////////////////
const closeModalBtn = document.querySelector('.close_modal');
const signUpBtn = document.querySelector('.register_btn');
const modal = document.querySelector('.modal_window');
const overlay = document.querySelector('.overlay');
//////////// REGISTER FORM ELEMENTS /////////////////
const registerForm = document.querySelector('#register_form');
const registerBtnForm = document.querySelector('.register_btn_form');
const registerUsername = document.querySelector('#username');
const registerEmail = document.querySelector('#register_email');
const registerPassword = document.querySelector('#register_password');
const confirmPassword = document.querySelector('#confirm_password');
//////////// LOGIN FORM ELEMENTS /////////////////
const loginForm = document.querySelector('#login_form');
const loginBtn = document.querySelector('.login_btn');
const loginPassword = document.querySelector('#login_password');
const loginEmail = document.querySelector('#login_email');

//////////// MODAL WINDOW /////////////////
const openModal = function (e) {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function (e) {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

signUpBtn.addEventListener('click', openModal);

[closeModalBtn, overlay].forEach(ev =>
  ev.addEventListener('click', closeModal)
);

window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

//////////// LOGIN VALIDATION /////////////////

const config = {
  username: {
    required: true,
    minLength: 5,
    maxLength: 50,
  },
  register_email: {
    required: true,
    email: true,
    minLength: 5,
    maxLength: 50,
  },
  register_password: {
    required: true,
    minLength: 7,
    maxLength: 25,
    matching: 'confirm_password',
  },
  confirm_password: {
    required: true,
    minLength: 7,
    maxLength: 25,
    matching: 'register_password',
  },
};

const validator = new Validator(config, '#register_form');

//////////// REGISTER NEW ACCOUNT /////////////////
registerForm.addEventListener('submit', function (e) {
  e.preventDefault();

  if (validator.validationPassed()) {
    const user = new User();
    user.email = registerEmail.value;
    user.username = registerUsername.value;
    user.password = registerPassword.value;

    user.checkExistingUser(registerUsername, registerEmail);
  }
});

//////////// LOGIN /////////////////

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const email = loginEmail.value;
  const password = loginPassword.value;

  const user = new User();
  user.email = email;
  user.password = password;

  user.login(loginEmail, loginPassword);
});

//////////// CLEAR INPUT FIELDS' ERROR MESSAGES /////////////////
const loginInputFields = [loginEmail, loginPassword];

loginInputFields.forEach(inputField => {
  inputField.addEventListener('input', function () {
    const errorMessageElement = inputField.nextElementSibling;
    errorMessageElement.innerHTML = '';
  });
});
