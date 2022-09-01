EventTarget.onClick = (callback) => this.addEventListener('click', callback);
const $ = (sel) => document.querySelector(sel);

const oauthURL = 'https://discord.com/api/oauth2/authorize?client_id=869983919578173482&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=token&scope=identify'

window.onload = () => {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

  if (!accessToken) {
    return (document.getElementById('login').style.display = 'block');
  }

  fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `${tokenType} ${accessToken}`,
    },
  })
    .then(result => result.json())
    .then(response => {
      const { username, discriminator } = response;
      document.getElementById('info').innerText += ` ${username}#${discriminator}`;
    })
    .catch(console.error);
};

$('#login').onClick(() => location.replace(oauthURL));