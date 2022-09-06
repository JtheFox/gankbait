const formStatus = $('#form-status');
const nameInput = $('#name-input');
const regionInput = $('#region-input');
const formSubmitBtn = $('#form-submit');
const nameLabel = $('#summoner-name');
const statsDisplay = $('#stats-container');
const statsLoader = $('#stats-loader');
const statsError = $('#stats-error');
const statsOwner = $('#stats-owner');

const toggleStats = (state = null) => {
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
      break;
    default:
      statsDisplay.style.display = 'block';
      statsLoader.style.display = 'none';
      statsError.style.display = 'none';
      break;
  }
}

const toggleForm = (state = null) => {
  formStatus.classList.remove('is-success', 'is-danger');
  nameInput.classList.remove('is-success', 'is-danger');
  formStatus.textContent = '';

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
      formStatus.textContent = 'Failed to update summoner. Check that the name and region are correct.';
      break;
    default: break;
  }
}

const getStats = async () => {
  toggleStats('loading');
  const res = await fetch('/api/matches');
  if (res.ok) document.location.reload();
  else toggleStats('error');
}

onClick(formSubmitBtn, async () => {
  toggleForm();
  if (!nameInput.value.length) toggleForm('fail');

  const selected = regionInput.options[regionInput.selectedIndex].value
  const data = {
    name: nameInput.value,
    region: selected
  }

  const res = await fetch('/api/summoner', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    const summoner = await res.json();
    toggleForm('success');
    nameLabel.textContent = statsOwner.textContent = summoner.name;
    toggleStats('loading');
    getStats();
  } else toggleForm('fail');
});

onClick($('#btn-update'), getStats);

window.onload = () => {
  toggleForm();
  toggleStats();
}