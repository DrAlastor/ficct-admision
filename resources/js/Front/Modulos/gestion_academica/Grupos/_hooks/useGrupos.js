import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function useGrupos(grupos_actuales) {
    const { post, processing } = useForm();
    const [confirmAction, setConfirmAction] = useState(false);
    const [alertConfig, setAlertConfig] = useState(null);

    const handleGenerar = (e) => {
        e.preventDefault();
        setConfirmAction(true); // Open the confirm modal instead of browser confirm
    };

    const executeGenerar = () => {
        setConfirmAction(false);
        post(route('grupos.generar'), {
            preserveScroll: true,
            onSuccess: () => {
                setAlertConfig({ message: '¡Grupos generados exitosamente!', type: 'success' });
            },
            onError: (err) => {
                setAlertConfig({ message: err.error || 'Hubo un error al generar los grupos.', type: 'error' });
            }
        });
    };

    const closeAlert = () => setAlertConfig(null);
    const cancelConfirm = () => setConfirmAction(false);

    const uniqueGroups = [...new Set(grupos_actuales.map(g => g.nombre))];

    return {
        processing,
        confirmAction,
        alertConfig,
        handleGenerar,
        executeGenerar,
        closeAlert,
        cancelConfirm,
        uniqueGroups
    };
}
