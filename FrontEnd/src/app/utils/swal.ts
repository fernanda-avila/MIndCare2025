import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export function swalSuccess(title = 'Sucesso', text?: string) {
  return MySwal.fire({
    icon: 'success',
    iconColor: '#047857',
    title,
    text,
  confirmButtonColor: '#FB923C',
  customClass: { confirmButton: 'mc-swal-confirm' },
  });
}

export function swalError(title = 'Erro', text?: string) {
  return MySwal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#FB923C',
    customClass: { confirmButton: 'mc-swal-confirm' },
  });
}

export function swalInfo(title = 'Atenção', text?: string) {
  return MySwal.fire({
    icon: 'info',
    iconColor: '#047857',
    title,
    text,
    confirmButtonColor: '#FB923C',
    customClass: { confirmButton: 'mc-swal-confirm' },
  });
}

export function swalConfirm(options: { title?: string; text?: string; confirmButtonText?: string; cancelButtonText?: string; }) {
  return MySwal.fire({
    icon: 'question',
    iconColor: '#6b7280', // cinza neutro
    title: options.title || 'Confirma?',
    text: options.text || '',
    showCancelButton: true,
  confirmButtonColor: '#FB923C',
  cancelButtonColor: '#6b7280',
  customClass: { confirmButton: 'mc-swal-confirm', cancelButton: 'mc-swal-cancel' },
    confirmButtonText: options.confirmButtonText || 'Sim',
    cancelButtonText: options.cancelButtonText || 'Cancelar',
  });
}
