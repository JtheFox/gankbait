const $ = (sel) => document.querySelector(sel);
const onClick = (el, cb) => el.addEventListener('click', cb)

const oauthURL = 'https://discord.com/api/oauth2/authorize?client_id=869983919578173482&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin&response_type=code&scope=identify'

window.onload = async () => {
};

if ($('#login')) onClick($('#login'), () => location.replace(oauthURL));
else onClick($('#logout'), () => location.replace('/logout'));