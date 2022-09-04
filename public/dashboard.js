const formStatus = $('#form-status');
const nameInput = $('#name-input');
const regionInput = $('#region-input');
const formSubmitBtn = $('#form-submit');
const nameLabel = $('#summoner-name')

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
    nameLabel.textContent = summoner.name;
  } else toggleForm('fail');
});