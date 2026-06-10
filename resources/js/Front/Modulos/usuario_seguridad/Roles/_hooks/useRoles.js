import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

export default function useRoles(filters) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRol, setSelectedRol] = useState(null);
    const [deleteConfirmRol, setDeleteConfirmRol] = useState(null);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            router.get(route('roles.index'), { search: searchQuery }, {
                preserveState: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const openModal = (rol = null) => {
        setSelectedRol(rol);
        setIsModalOpen(true);
    };

    const handleDelete = (rol) => {
        setDeleteConfirmRol(rol);
    };

    const confirmDelete = () => {
        if (deleteConfirmRol) {
            router.delete(route('roles.destroy', deleteConfirmRol.id), {
                preserveScroll: true,
                onSuccess: () => setDeleteConfirmRol(null)
            });
        }
    };

    return {
        searchQuery,
        handleSearch,
        isModalOpen,
        setIsModalOpen,
        selectedRol,
        openModal,
        deleteConfirmRol,
        setDeleteConfirmRol,
        handleDelete,
        confirmDelete
    };
}
