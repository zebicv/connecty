class Validator {
  constructor(config, formID) {
    this.configElements = config;
    this.formID = formID;
    this.errors = {};

    this.createErrorsObject();
    this.inputListener();
  }

  // CREATE AN ARRAY FOR EACH INPUT ELEMENT
  createErrorsObject() {
    for (let element in this.configElements) {
      this.errors[element] = [];
    }
  }

  // ASSIGN INPUT EVENT ON EACH ELEMENT
  inputListener() {
    for (let element in this.configElements) {
      let inputElement = document.querySelector(
        `${this.formID} input[name="${element}"]`
      );

      inputElement.addEventListener('input', this.validate.bind(this));
    }
  }

  validate(e) {
    const elFields = this.configElements;
    const field = e.target;
    const fieldValue = field.value;
    const fieldName = field.getAttribute('name');

    this.errors[fieldName] = [];

    // 1. Check if fields are required
    if (elFields[fieldName].required) {
      if (fieldValue === '')
        this.errors[fieldName].push('This field is required');
    }

    // 2. Email validation
    if (elFields[fieldName].email) {
      if (!this.validateEmail(fieldValue))
        this.errors[fieldName].push('Invalid email address');
    }

    // 3. Field value length validation
    if (
      fieldValue.length < elFields[fieldName].minLength ||
      fieldValue.length > elFields[fieldName].maxLength
    )
      this.errors[fieldName].push(
        `This cell must contain betweeen ${elFields[fieldName].minLength} and ${elFields[fieldName].maxLength} characters`
      );

    // 4. Password validation
    if (elFields[fieldName].matching) {
      let matchingElement = document.querySelector(
        `${this.formID} input[name="${elFields[fieldName].matching}"]`
      );

      if (fieldValue !== matchingElement.value)
        this.errors[fieldName].push('Passwords are not the same');

      if (this.errors[fieldName].length === 0) {
        this.errors[fieldName] = [];
        this.errors[elFields[fieldName].matching] = [];
      }
    }
    this.populateErrors(this.errors);
  }

  validationPassed() {
    for (let key of Object.keys(this.errors)) {
      if (this.errors[key].length > 0) return false;
    }

    return true;
  }

  populateErrors(errors) {
    for (const element of document.querySelectorAll('ul')) element.remove();

    for (let key of Object.keys(errors)) {
      const parentEl = document.querySelector(
        `${this.formID} input[name="${key}"]`
      ).parentElement;

      const errorsEl = document.createElement('ul');
      parentEl.appendChild(errorsEl);

      errors[key].forEach(error => {
        const li = document.createElement('li');
        li.innerHTML = `
              <ion-icon name="close-circle-outline"></ion-icon>
              <span>${error}</span>
              `;

        errorsEl.appendChild(li);
      });
    }
  }

  validateEmail(email) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
      return true;

    return false;
  }
}
