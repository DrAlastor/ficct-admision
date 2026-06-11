import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function useHorarios() {
    const { post, processing } = useForm();
    const [confirmAction, setConfirmAction] = useState(false);
    const [alertConfig, setAlertConfig] = useState(null);

    const handleGenerar = (e) => {
        e.preventDefault();
        setConfirmAction(true);
    };

    const executeGenerar = () => {
        setConfirmAction(false);
        post(route('horarios.admin.generar'), {
            preserveScroll: true,
            onSuccess: () => {
                setAlertConfig({ message: '¡Malla horaria generada exitosamente! Los horarios fueron asignados de manera aleatoria a cada grupo.', type: 'success' });
            },
            onError: (err) => {
                setAlertConfig({ message: err.error || 'Hubo un error al generar los horarios. Asegúrate de tener grupos generados y aulas suficientes.', type: 'error' });
            }
        });
    };

    const closeAlert = () => setAlertConfig(null);
    const cancelConfirm = () => setConfirmAction(false);

    return {
        processing,
        confirmAction,
        alertConfig,
        handleGenerar,
        executeGenerar,
        closeAlert,
        cancelConfirm
    };
}
