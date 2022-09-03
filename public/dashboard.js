const formStatus = $('#form-status');
const nameInput = $('#name-input');

const toggleForm = (state) => {
  formStatus.classList.remove('is-success', 'is-danger');
  nameInput.classList.remove('is-success', 'is-danger');
  switch (state) {
    case 'success':
      formStatus.classList.add('is-success');
      nameInput.classList.add('is-success');
      formStatus.textContent = 'Summoner name updated successfully.';
      nameInput.value = '';
      break;
    case 'fail':
      formStatus.classList.add('is-danger');
      nameInput.classList.add('is-danger');
      formStatus.textContent = 'Summoner failed to update. Check that the name and region are correct.';
      break;
    default: break;
  }
}

const handleFormSuccess = () => {
  toggleForm('success');
}

const handleFormFail = () => {
    toggleForm('fail');
}