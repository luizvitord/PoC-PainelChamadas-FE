import { API_BASE_URL } from '@/lib/appConfig';

export const api = {
    paciente: {
        create: async(data: any) => {
            const response = await fetch(`${API_BASE_URL}/pacientes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            return response.json();
        },


    },

    consultorios: {

    },

    triagem: {

    }
}