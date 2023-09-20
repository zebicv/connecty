class User {
  user_id = '';
  email = '';
  username = '';
  password = '';
  api_url = 'https://6420c09025cb6572104edd07.mockapi.io';

  create() {
    let data = {
      email: this.email,
      username: this.username,
      password: this.password,
    };

    data = JSON.stringify(data);

    fetch(`${this.api_url}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    })
      .then(response => response.json())
      .then(data => {
        // SETTING A COOKIE
        const session = new Session();
        session.user_id = data.id;
        session.setSession();

        window.location.href = 'connecty.html';
      });
  }

  showRegisterErrorMessage(parentEl, errorMsg) {
    const errorMessageEl = parentEl.querySelector('.errors_messages');
    errorMessageEl.innerHTML = `<li>
          <ion-icon name="close-circle-outline"></ion-icon>
          <span>${errorMsg}</span>
        </li>`;
  }

  async checkExistingUser(usernameEl, emailEl) {
    const response = await fetch(`${this.api_url}/users`);
    const data = await response.json();

    if (
      data.some(
        dbUser =>
          dbUser.username === this.username && dbUser.email !== this.email
      )
    ) {
      const parentUsernameEl = usernameEl.parentElement;
      this.showRegisterErrorMessage(
        parentUsernameEl,
        'Username already exists.'
      );

      return;
    }

    if (
      data.some(
        dbUser =>
          dbUser.username !== this.username && dbUser.email === this.email
      )
    ) {
      const parentEmailEl = emailEl.parentElement;
      this.showRegisterErrorMessage(parentEmailEl, 'Email already exists.');
      return;
    }

    if (
      data.some(
        dbUser =>
          dbUser.username === this.username && dbUser.email === this.email
      )
    ) {
      const parentUsernameEl = usernameEl.parentElement;
      this.showRegisterErrorMessage(
        parentUsernameEl,
        'Username already exists.'
      );

      const parentEmailEl = emailEl.parentElement;
      this.showRegisterErrorMessage(parentEmailEl, 'Email already exists.');

      return;
    }

    this.create();
  }

  async getAllUsers() {
    const response = await fetch(`${this.api_url}/users`);
    const data = await response.json();
    return data;
  }

  async getUser(sessionId) {
    const response = await fetch(`${this.api_url}/users/${sessionId}`);
    const data = await response.json();
    return data;
  }

  async checkAllUsers(currentUserId, editEmailField, editUsernameField) {
    const response = await fetch(`${this.api_url}/users`);
    const data = await response.json();

    // REMOVE CURRENT USER FROM ALL USERS ARRAY
    const indexCurrentUser = data.map(user => user.id).indexOf(currentUserId);
    data.splice(indexCurrentUser, 1);

    // USERNAME ALREADY EXISTS
    if (
      data.some(
        dbUser =>
          dbUser.username === this.username && dbUser.email !== this.email
      )
    ) {
      this.showErrorMessage(editUsernameField, 'Username already exists');
      return true;
    }

    // EMAIL ALREADY EXISTS
    if (
      data.some(
        dbUser =>
          dbUser.username !== this.username && dbUser.email === this.email
      )
    ) {
      this.showErrorMessage(editEmailField, 'Email already exists');
      return true;
    }

    // BOTH USERNAME AND EMAIL ALREADY EXIST
    if (
      data.some(
        dbUser =>
          dbUser.username === this.username && dbUser.email === this.email
      )
    ) {
      this.showErrorMessage(editUsernameField, 'Username already exists');
      this.showErrorMessage(editEmailField, 'Email already exists');
      return true;
    }

    return false;
  }

  showErrorMessage(inputElement, errorMessage) {
    const errorElement = document.querySelector(`#${inputElement.name}_error`);
    errorElement.innerHTML = `
    <ion-icon name="close-circle-outline"></ion-icon>
    <span>${errorMessage}</span>
    `;
  }

  async login(loginEmailEl, loginPasswordEl) {
    const response = await fetch(`${this.api_url}/users`);
    const data = await response.json();
    let loginPassed = 0;

    data.forEach(user => {
      if (user.email === this.email && user.password === this.password) {
        loginPassed = 1;
        window.location.href = 'connecty.html';

        const session = new Session();
        session.user_id = user.id;
        session.setSession();
      }
    });

    if (!loginPassed) {
      const userExists = data.some(user => user.email === this.email);
      if (userExists) {
        this.showErrorMessage(
          loginPasswordEl,
          'Entered password is not valid.'
        );
      } else {
        this.showErrorMessage(loginEmailEl, 'User does not exist.');
      }
    }
  }

  async editUser(userId) {
    let data = {
      email: this.email,
      username: this.username,
    };

    data = JSON.stringify(data);

    const response = await fetch(`${this.api_url}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    })
      .then(data => data.json())
      .then(data => (window.location.href = 'connecty.html'));

    return response;
  }

  async deleteUser(sessionId) {
    const response = await fetch(`${this.api_url}/users/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
  }
}
