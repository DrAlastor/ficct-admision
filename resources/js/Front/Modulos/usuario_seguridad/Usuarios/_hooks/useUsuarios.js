import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

export default function useUsuarios(filters) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            router.get(route('usuarios.index'), { search: searchQuery }, {
                preserveState: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const openModal = (usuario = null) => {
        setSelectedUsuario(usuario);
        setIsModalOpen(true);
    };

    const handleDelete = (usuario) => {
        setDeleteConfirmUser(usuario);
    };

    const confirmDelete = () => {
        if (deleteConfirmUser) {
            router.delete(route('usuarios.destroy', deleteConfirmUser.id), {
                preserveScroll: true,
                onSuccess: () => setDeleteConfirmUser(null)
            });
        }
    };

    return {
        searchQuery,
        handleSearch,
        isModalOpen,
        setIsModalOpen,
        selectedUsuario,
        openModal,
        deleteConfirmUser,
        setDeleteConfirmUser,
        handleDelete,
        confirmDelete
    };
}
