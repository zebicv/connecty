class Comment {
  user_id = '';
  post_id = '';
  content = '';
  username = '';
  date = '';
  api_url = 'https://6420c09025cb6572104edd07.mockapi.io';

  async createComment() {
    if (this.content === '') return;

    let data = {
      user_id: this.user_id,
      post_id: this.post_id,
      content: this.content,
      username: this.username,
      date: this.date,
      isVisible: true,
    };

    data = JSON.stringify(data);

    const response = fetch(`${this.api_url}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    }).then(data => data.json());

    return response;
  }

  async getAllComments() {
    const response = await fetch(`${this.api_url}/comments`);
    const data = await response.json();
    return data;
  }

  deleteComment(comment_id) {
    const response = fetch(`${this.api_url}/comments/${comment_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(data => data.json());
  }
}
