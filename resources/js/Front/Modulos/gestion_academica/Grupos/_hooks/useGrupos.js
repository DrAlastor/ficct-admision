import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function useGrupos(grupos_actuales) {
    const { post, put, delete: destroy, processing } = useForm();
    const [confirmAction, setConfirmAction] = useState(false);
    const [alertConfig, setAlertConfig] = useState(null);

    const handleGenerar = (e) => {
        e.preventDefault();
        setConfirmAction(true);
    };

    const executeGenerar = () => {
        setConfirmAction(false);
        post(route('grupos.generar'), {
            preserveScroll: true,
            onSuccess: () => setAlertConfig({ message: '¡Grupos generados exitosamente!', type: 'success' }),
            onError: (err) => setAlertConfig({ message: err.error || 'Error al generar.', type: 'error' })
        });
    };

    const handleToggleInscripciones = () => {
        post(route('grupos.toggle_inscripciones'), {
            preserveScroll: true,
            onSuccess: () => setAlertConfig({ message: 'Estado de inscripciones actualizado.', type: 'success' })
        });
    };

    const handleAsignarAlumnos = () => {
        post(route('grupos.asignar_alumnos'), {
            preserveScroll: true,
            onSuccess: () => setAlertConfig({ message: 'Alumnos asignados correctamente.', type: 'success' }),
            onError: (err) => setAlertConfig({ message: err.error || 'Error al asignar alumnos.', type: 'error' })
        });
    };

    const handleEdit = (nombre, cupo, modalidad) => {
        put(route('grupos.update', nombre), {
            cupo, modalidad,
            preserveScroll: true,
            onSuccess: () => setAlertConfig({ message: 'Grupo actualizado.', type: 'success' })
        });
    };

    const handleDelete = (nombre) => {
        if(confirm(`¿Eliminar grupo ${nombre}?`)) {
            destroy(route('grupos.destroy', nombre), {
                preserveScroll: true,
                onSuccess: () => setAlertConfig({ message: 'Grupo eliminado.', type: 'success' })
            });
        }
    };

    const handleDownload = (nombre, format) => {
        window.open(`/grupos/${nombre}/${format}`, '_blank');
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
        cancelConfirm,
        handleToggleInscripciones,
        handleAsignarAlumnos,
        handleEdit,
        handleDelete,
        handleDownload,
        gruposList: grupos_actuales
    };
}
