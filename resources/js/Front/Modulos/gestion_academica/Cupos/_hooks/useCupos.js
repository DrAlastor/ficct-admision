import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function useCupos(carreras, limite_grupo_actual) {
    const { data, setData, post, processing, errors } = useForm({
        carreras: carreras.map(c => ({
            codigo: c.codigo,
            nombre: c.nombre,
            sigla: c.sigla,
            cupo_maximo: c.cupo_maximo
        })),
        limite_grupo: limite_grupo_actual
    });

    const [alertConfig, setAlertConfig] = useState(null); // { message: string, type: 'success' | 'error' }

    const handleCarreraChange = (index, value) => {
        const val = parseInt(value, 10);
        const newCarreras = [...data.carreras];
        newCarreras[index].cupo_maximo = isNaN(val) ? '' : Math.max(0, val);
        setData('carreras', newCarreras);
    };

    const handleLimiteChange = (value) => {
        const val = parseInt(value, 10);
        setData('limite_grupo', isNaN(val) ? '' : Math.max(0, val));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('cupos.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setAlertConfig({ message: 'Configuración de cupos guardada correctamente', type: 'success' });
            },
            onError: () => {
                setAlertConfig({ message: 'Hubo un error al guardar los cupos. Verifica los datos ingresados.', type: 'error' });
            }
        });
    };

    const closeAlert = () => setAlertConfig(null);

    return {
        data,
        processing,
        errors,
        alertConfig,
        handleCarreraChange,
        handleLimiteChange,
        handleSubmit,
        closeAlert
    };
}
