import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function useBitacora(filters) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedUser, setSelectedUser] = useState(filters.usuario_id || '');
    const [fechaDesde, setFechaDesde] = useState(filters.fecha_desde || '');
    const [fechaHasta, setFechaHasta] = useState(filters.fecha_hasta || '');

    const handleFilter = () => {
        router.get(route('bitacora.index'), {
            search: searchQuery,
            usuario_id: selectedUser,
            fecha_desde: fechaDesde,
            fecha_hasta: fechaHasta
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClear = () => {
        setSearchQuery('');
        setSelectedUser('');
        setFechaDesde('');
        setFechaHasta('');
        router.get(route('bitacora.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    return {
        searchQuery,
        setSearchQuery,
        selectedUser,
        setSelectedUser,
        fechaDesde,
        setFechaDesde,
        fechaHasta,
        setFechaHasta,
        handleFilter,
        handleClear
    };
}
