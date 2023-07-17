class Session {
  user_id = '';

  setSession() {
    const date = new Date();
    date.setTime(date.getTime() + 2 * 24 * 60 * 60 * 1000);
    date.toUTCString();

    document.cookie = `user_id=${this.user_id};expires=${date}`;
  }

  getSession() {
    const name = 'user_id';
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }

    return '';
  }

  endSession() {
    let cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      let eqPos = cookie.indexOf('=');
      let name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }
}
