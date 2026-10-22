import type { Locale } from '@/lib/i18n'

export const accountDeletionMessages: Record<Locale, {
  title: string
  intro: string
  request: string
  pendingTitle: string
  pendingCopy: string
  cancel: string
  requestSuccess: string
  cancelSuccess: string
  error: string
  adminTitle: string
  adminIntro: string
  empty: string
  customer: string
  staff: string
  openWork: string
  noOpenWork: string
  blocked: string
  delete: string
  reviewCancel: string
  confirm: string
  deleted: string
  blockedNow: string
}> = {
  es: {
    title: 'Eliminar cuenta',
    intro: 'Puedes solicitar la eliminación de tu cuenta. Administración revisará primero que no haya servicios pendientes.',
    request: 'Solicitar eliminación',
    pendingTitle: 'Solicitud en revisión',
    pendingCopy: 'La cuenta solo se eliminará cuando administración confirme que no hay servicios pendientes. Mientras tanto, no se pueden crear nuevas solicitudes.',
    cancel: 'Cancelar solicitud',
    requestSuccess: 'Solicitud enviada para revisión.',
    cancelSuccess: 'Solicitud de eliminación cancelada.',
    error: 'No se pudo actualizar la solicitud. Inténtalo de nuevo.',
    adminTitle: 'Solicitudes de eliminación de cuenta',
    adminIntro: 'Comprueba las tareas abiertas antes de eliminar definitivamente una cuenta.',
    empty: 'No hay solicitudes de eliminación pendientes.',
    customer: 'Cliente',
    staff: 'Colaborador',
    openWork: 'servicios pendientes',
    noOpenWork: 'Sin servicios pendientes detectados. Revisa el expediente antes de confirmar.',
    blocked: 'No se puede eliminar todavía: hay servicios pendientes.',
    delete: 'Eliminar definitivamente',
    reviewCancel: 'Retirar solicitud',
    confirm: 'Esta acción eliminará permanentemente la cuenta y sus datos personales. ¿Deseas continuar?',
    deleted: 'Cuenta eliminada.',
    blockedNow: 'La cuenta tiene trabajo pendiente y no se ha eliminado.',
  },
  fr: {
    title: 'Supprimer le compte',
    intro: 'Vous pouvez demander la suppression de votre compte. L\'administration vérifiera d\'abord qu\'aucune prestation n\'est en attente.',
    request: 'Demander la suppression',
    pendingTitle: 'Demande en cours de vérification',
    pendingCopy: 'Le compte sera supprimé uniquement après confirmation de l\'absence de prestations en attente. Aucune nouvelle demande ne peut être créée entre-temps.',
    cancel: 'Annuler la demande',
    requestSuccess: 'Demande envoyée pour vérification.',
    cancelSuccess: 'Demande de suppression annulée.',
    error: 'Impossible de mettre à jour la demande. Réessayez.',
    adminTitle: 'Demandes de suppression de compte',
    adminIntro: 'Vérifiez les prestations en cours avant de supprimer définitivement un compte.',
    empty: 'Aucune demande de suppression en attente.',
    customer: 'Client',
    staff: 'Collaborateur',
    openWork: 'prestations en attente',
    noOpenWork: 'Aucune prestation en attente détectée. Vérifiez le dossier avant de confirmer.',
    blocked: 'La suppression est bloquée : des prestations sont en attente.',
    delete: 'Supprimer définitivement',
    reviewCancel: 'Retirer la demande',
    confirm: 'Cette action supprimera définitivement le compte et ses données personnelles. Continuer ?',
    deleted: 'Compte supprimé.',
    blockedNow: 'Des prestations sont en attente. Le compte n\'a pas été supprimé.',
  },
  en: {
    title: 'Delete account',
    intro: 'You can request account deletion. An administrator will first check that no services are still pending.',
    request: 'Request deletion',
    pendingTitle: 'Request under review',
    pendingCopy: 'Your account will only be deleted after an administrator confirms there are no pending services. New service requests are disabled in the meantime.',
    cancel: 'Cancel request',
    requestSuccess: 'Deletion request submitted for review.',
    cancelSuccess: 'Deletion request cancelled.',
    error: 'Could not update the request. Please try again.',
    adminTitle: 'Account deletion requests',
    adminIntro: 'Check open work before permanently deleting an account.',
    empty: 'There are no account deletion requests to review.',
    customer: 'Customer',
    staff: 'Staff member',
    openWork: 'pending services',
    noOpenWork: 'No pending services found. Review the account before confirming.',
    blocked: 'This account cannot be deleted yet because it has pending services.',
    delete: 'Delete permanently',
    reviewCancel: 'Withdraw request',
    confirm: 'This permanently deletes the account and its personal data. Continue?',
    deleted: 'Account deleted.',
    blockedNow: 'This account has pending work and was not deleted.',
  },
}

export function formatPendingWork(message: string, count: number) {
  return message.replace('{count}', String(count))
}

export const pendingWorkMessage = {
  es: 'No se puede eliminar todavía: hay {count} servicios pendientes.',
  fr: 'Suppression bloquée : {count} prestations sont en attente.',
  en: 'This account cannot be deleted yet: {count} services are pending.',
} satisfies Record<Locale, string>

export const deleteConfirmationMessage = {
  es: 'Esta acción eliminará permanentemente la cuenta y sus datos personales. ¿Deseas continuar?',
  fr: 'Cette action supprimera définitivement le compte et ses données personnelles. Continuer ?',
  en: 'This permanently deletes the account and its personal data. Continue?',
} satisfies Record<Locale, string>

export const blockedNowMessage = {
  es: 'La cuenta tiene trabajo pendiente y no se ha eliminado.',
  fr: 'Des prestations sont en attente. Le compte n\'a pas été supprimé.',
  en: 'This account has pending work and was not deleted.',
} satisfies Record<Locale, string>

export const deletedAccountMessage = {
  es: 'Cuenta eliminada.',
  fr: 'Compte supprimé.',
  en: 'Account deleted.',
} satisfies Record<Locale, string>

export const accountDeletionErrorMessage = {
  es: 'No se pudo completar la eliminación. Inténtalo de nuevo.',
  fr: 'Impossible de terminer la suppression. Réessayez.',
  en: 'Could not complete the deletion. Please try again.',
} satisfies Record<Locale, string>

export const pendingWorkDescription = {
  es: 'No se puede eliminar todavía: hay servicios pendientes.',
  fr: 'La suppression est bloquée : des prestations sont en attente.',
  en: 'This account cannot be deleted yet because it has pending services.',
} satisfies Record<Locale, string>

export const accountDeletionRoleLabel = {
  es: { customer: 'Cliente', staff: 'Colaborador' },
  fr: { customer: 'Client', staff: 'Collaborateur' },
  en: { customer: 'Customer', staff: 'Staff member' },
} satisfies Record<Locale, Record<'customer' | 'staff', string>>

export const accountDeletionPendingWord = {
  es: 'servicios pendientes',
  fr: 'prestations en attente',
  en: 'pending services',
} satisfies Record<Locale, string>

export const accountDeletionSafeToProceed = {
  es: 'Sin servicios pendientes detectados. Revisa el expediente antes de confirmar.',
  fr: 'Aucune prestation en attente détectée. Vérifiez le dossier avant de confirmer.',
  en: 'No pending services found. Review the account before confirming.',
} satisfies Record<Locale, string>

export const accountDeletionDateLabel = {
  es: 'Solicitado el',
  fr: 'Demandé le',
  en: 'Requested on',
} satisfies Record<Locale, string>

export const accountDeletionNoticeSuccess = {
  es: 'Solicitud enviada para revisión.',
  fr: 'Demande envoyée pour vérification.',
  en: 'Deletion request submitted for review.',
} satisfies Record<Locale, string>

export const accountDeletionCancelSuccess = {
  es: 'Solicitud de eliminación cancelada.',
  fr: 'Demande de suppression annulée.',
  en: 'Deletion request cancelled.',
} satisfies Record<Locale, string>

export const accountDeletionActionError = {
  es: 'No se pudo actualizar la solicitud. Inténtalo de nuevo.',
  fr: 'Impossible de mettre à jour la demande. Réessayez.',
  en: 'Could not update the request. Please try again.',
} satisfies Record<Locale, string>

export const accountDeletionAdminEmpty = {
  es: 'No hay solicitudes de eliminación pendientes.',
  fr: 'Aucune demande de suppression en attente.',
  en: 'There are no account deletion requests to review.',
} satisfies Record<Locale, string>

export const accountDeletionReviewCancelLabel = {
  es: 'Retirar solicitud',
  fr: 'Retirer la demande',
  en: 'Withdraw request',
} satisfies Record<Locale, string>

export const accountDeletionFinalDeleteLabel = {
  es: 'Eliminar definitivamente',
  fr: 'Supprimer définitivement',
  en: 'Delete permanently',
} satisfies Record<Locale, string>

export const accountDeletionPendingReviewCopy = {
  es: 'La cuenta solo se eliminará cuando administración confirme que no hay servicios pendientes. Mientras tanto, no se pueden crear nuevas solicitudes.',
  fr: 'Le compte sera supprimé uniquement après confirmation de l\'absence de prestations en attente. Aucune nouvelle demande ne peut être créée entre-temps.',
  en: 'Your account will only be deleted after an administrator confirms there are no pending services. New service requests are disabled in the meantime.',
} satisfies Record<Locale, string>

export const accountDeletionRequestIntro = {
  es: 'Puedes solicitar la eliminación de tu cuenta. Administración revisará primero que no haya servicios pendientes.',
  fr: 'Vous pouvez demander la suppression de votre compte. L\'administration vérifiera d\'abord qu\'aucune prestation n\'est en attente.',
  en: 'You can request account deletion. An administrator will first check that no services are still pending.',
} satisfies Record<Locale, string>

export const accountDeletionAdminIntro = {
  es: 'Comprueba las tareas abiertas antes de eliminar definitivamente una cuenta.',
  fr: 'Vérifiez les prestations en cours avant de supprimer définitivement un compte.',
  en: 'Check open work before permanently deleting an account.',
} satisfies Record<Locale, string>

export const accountDeletionAdminTitle = {
  es: 'Solicitudes de eliminación de cuenta',
  fr: 'Demandes de suppression de compte',
  en: 'Account deletion requests',
} satisfies Record<Locale, string>

export const accountDeletionRequestLabel = {
  es: 'Solicitar eliminación',
  fr: 'Demander la suppression',
  en: 'Request deletion',
} satisfies Record<Locale, string>

export const accountDeletionPendingTitle = {
  es: 'Solicitud en revisión',
  fr: 'Demande en cours de vérification',
  en: 'Request under review',
} satisfies Record<Locale, string>

export const accountDeletionTitle = {
  es: 'Eliminar cuenta',
  fr: 'Supprimer le compte',
  en: 'Delete account',
} satisfies Record<Locale, string>

export const accountDeletionCancelLabel = {
  es: 'Cancelar solicitud',
  fr: 'Annuler la demande',
  en: 'Cancel request',
} satisfies Record<Locale, string>
