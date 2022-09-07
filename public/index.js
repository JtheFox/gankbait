const formStatus = $('#form-status');
const nameInput = $('#name-input');
const regionInput = $('#region-input');
const queueInput = $('#queue-input');
const formSubmitBtn = $('#form-submit');
const nameLabel = $('#summoner-name');
const statsDisplay = $('#stats-container');
const statsLoader = $('#stats-loader');
const statsError = $('#stats-error');
const statsTitle = $('#stats-title');
const statsOwner = $('#stats-owner');
const updateBtn = $('#btn-update');
const dismissBtn = $('#dismiss-error');

const toggleStats = (state = null, msg) => {
  switch (state) {
    case 'loading':
      statsDisplay.style.display = 'none';
      statsLoader.style.display = 'block';
      statsError.style.display = 'none';
      break;
    case 'error':
      statsDisplay.style.display = 'none';
      statsLoader.style.display = 'none';
      statsError.style.display = 'block';
      if (msg) $('#request-error').textContent = msg;
      break;
    default:
      statsDisplay.style.display = 'block';
      statsLoader.style.display = 'none';
      statsError.style.display = 'none';
      break;
  }
}

const toggleForm = (state = null, msg) => {
  formStatus.classList.remove('is-success', 'is-danger');
  nameInput.classList.remove('is-success', 'is-danger');
  formStatus.textContent = '';
  if (typeof msg !== 'string') msg = null;

  switch (state) {
    case 'success':
      formStatus.classList.add('is-success');
      nameInput.classList.add('is-success');
      formStatus.textContent = 'Summoner updated successfully.';
      nameInput.value = '';
      break;
    case 'fail':
      formStatus.classList.add('is-danger');
      nameInput.classList.add('is-danger');
      formStatus.textContent = `Failed to update summoner. ${msg ? msg : 'Check that the name and region are correct.'}`;
      break;
    default: break;
  }
}

const getStats = async () => {
  toggleStats('loading');
  const res = await fetch('/api/matches');
  switch (res.status) {
    case 200: return document.location.reload();
    case 204: return toggleStats('error', 'No matches found for the selected queue type. Go play some games and come back so we can have data to analyze!')
    case 429: return toggleStats('error', 'You are sending too many requests! Limit: 1 request per minute.');
    default:
      const err = await res.json();
      toggleStats('error', err.message);
      break;
  }
}

onClick(formSubmitBtn, async () => {
  toggleForm();
  const regionSel = $('#region-input').options[$('#region-input').selectedIndex].value;
  const queueSel = $('#queue-input').options[$('#queue-input').selectedIndex].value;
  const namesMatch = nameLabel.textContent === statsOwner.textContent;
  const selectMatch = regionSel === nameLabel.dataset.region && queueSel === nameLabel.dataset.queue;

  if (!nameInput.value.length && namesMatch && selectMatch) return toggleForm('fail', 'Field cannot be empty.');
  if (nameLabel.textContent === nameInput.value && selectMatch) return toggleForm('fail', 'You have already set this summoner name.')

  if (!namesMatch && selectMatch) {
    statsTitle.textContent = 'Stats for ' + nameLabel.textContent
    toggleStats('loading');
    return getStats();
  }

  const data = {
    name: nameInput.value || nameLabel.textContent,
    region: regionSel,
    queue: queueSel
  }

  const res = await fetch('/api/summoner', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (res.status === 204) return toggleForm('fail', 'Summoner name not found in selected region.');

  if (res.ok) {
    const summoner = await res.json();
    toggleForm('success');
    nameLabel.textContent = summoner.name;
    statsTitle.textContent = 'Stats for ' + summoner.name
    toggleStats('loading');
    getStats();
  } else toggleForm('fail');
});

updateBtn && onClick(updateBtn, getStats);

dismissBtn && onClick(dismissBtn, () => document.location.reload());

window.onload = () => {
  toggleForm();
  toggleStats();
  regionInput.value = nameLabel.dataset.region;
  queueInput.value = nameLabel.dataset.queue;
}