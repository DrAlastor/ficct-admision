import { useState, useMemo } from 'react';

export default function usePostulantes(postulantes) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCarrera, setSelectedCarrera] = useState('');
    const [activeTab, setActiveTab] = useState('Pendientes');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPostulante, setSelectedPostulante] = useState(null);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleCarreraChange = (e) => {
        setSelectedCarrera(e.target.value);
    };

    const openModal = (postulante = null) => {
        setSelectedPostulante(postulante);
        setIsModalOpen(true);
    };

    // Filter logic
    const filteredPostulantes = useMemo(() => {
        return postulantes.filter((p) => {
            const matchesSearch = 
                (p.nombres?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.apellido_paterno?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.apellido_materno?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.ci?.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCarrera = selectedCarrera === '' || 
                p.carrera_opcion_1 === selectedCarrera || 
                p.carrera_opcion_2 === selectedCarrera;

            const matchesTab = activeTab === 'Pendientes' 
                ? (p.estado === 'Pendiente' || p.estado === null)
                : (p.estado === 'Habilitado CUP' || p.estado === 'Habilitado' || p.estado === 'Aceptado');

            return matchesSearch && matchesCarrera && matchesTab;
        });
    }, [postulantes, searchQuery, selectedCarrera, activeTab]);

    return {
        searchQuery,
        handleSearch,
        selectedCarrera,
        handleCarreraChange,
        activeTab,
        setActiveTab,
        filteredPostulantes,
        isModalOpen,
        setIsModalOpen,
        selectedPostulante,
        openModal
    };
}
