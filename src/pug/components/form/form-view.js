import onChange from 'on-change';
import i18next from 'i18next';
import MyToster from '../toster/toster';

const toast = new MyToster({
  $wrap: document.querySelector('[data-toast-wrapper]'),
});

// BEGIN

const renderForm = (form, elements) => {
  const elementsParamFn = elements;
  const fieldsKey = Object.keys(elements.fields);

  switch (form.status) {
    case 'renderErrorValidation':
      elementsParamFn.$btnSubmit.setAttribute('disabled', true);
      fieldsKey.forEach((key) => {
        const field = elementsParamFn.fields[key];
        if (field.valid) {
          field.inputWrapper.showSuccessStyle();
          field.inputWrapper.writeMessage(field.defaultMessage);
        } else {
          field.inputWrapper.showErrorStyle();
          field.inputWrapper.addSelectedStyle();
          field.inputWrapper.writeMessage(field.error[0]);
        }
      });
      break;
    case 'renderSuccessValidation':
      elementsParamFn.$btnSubmit.removeAttribute('disabled');

      fieldsKey.forEach((key) => {
        const field = elementsParamFn.fields[key];
        field.inputWrapper.showSuccessStyle();
        field.inputWrapper.writeMessage(field.defaultMessage);
      });
      break;

    case 'loading':
      fieldsKey.forEach((key) => {
        const field = elementsParamFn.fields[key];
        field.inputWrapper.showLoadingStyle();
      });

      elementsParamFn.$btnSubmit.setAttribute('disabled', true);
      elementsParamFn.$btnSubmit.querySelector('[data-btn-submit-text]').innerHTML = i18next.t(
        'sending',
      );

      break;
    case 'successSand':
      fieldsKey.forEach((key) => {
        const field = elementsParamFn.fields[key];
        field.inputWrapper.showDefaultStyle();
        field.inputWrapper.removeSelectedStyle();
      });
      elementsParamFn.$form.reset();
      elementsParamFn.$btnSubmit.setAttribute('disabled', false);
      elementsParamFn.$btnSubmit.querySelector('[data-btn-submit-text]').innerHTML = i18next.t(
        'send',
      );
      /*  */
      toast.addToast({
        type: 'success',
        text: i18next.t('sendingSuccessText'),
        title: i18next.t('sendingSuccessTitle'),
      });
      break;

    case 'filling':
      break;
    case 'failed':
      console.log('toast.addToast({');
      toast.addToast({
        type: 'error',
        text: i18next.t(form.serverError),
        title: 'Сталася помилка',
      });
      elementsParamFn.$btnSubmit.removeAttribute('disabled');
      elementsParamFn.$btnSubmit.querySelector('[data-btn-submit-text]').innerHTML = i18next.t(
        'send',
      );
      break;

    default:
      throw Error(`Unknown form status: ${form.status}`);
  }
};

/* const renderFormErrors = (form, elementsParamFn) => {
  const error = elementsParamFn.input.nextSibling;
  if (error) {
    error.remove();
  }

  const field = form.fields.name;
  if (field.valid) {
    elementsParamFn.input.classList.remove('is-invalid');
  } else {
    elementsParamFn.input.classList.add('is-invalid');
    const errorElement = buildErrorElement(field.error);
    elementsParamFn.input.after(errorElement);
  }
};

const renderForm = (error, elementsParamFn) => {
  if (!error) return;
  const toastBody = elementsParamFn.toast.querySelector('.toast-body');
  toastBody.textContent = error;
  $('.toast').toast('show');
} */

const initView = (state, elementsParamFn) => {
  // elementsParamFn.input.focus();

  const mapping = {
    status: () => renderForm(state, elementsParamFn),
    /*
    'form.fields.name': () => renderFormErrors(state.form, elementsParamFn),
    'form.submitCount': () => elementsParamFn.input.focus(),
    error: () => renderAppError(state.error, elementsParamFn),
    todos: () => renderTodos(state.todos, elementsParamFn), */
  };

  const watchedState = onChange(state, (path, value) => {
    console.log(path, value);
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};

export default initView;
// END
