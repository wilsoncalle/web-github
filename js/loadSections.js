document.addEventListener('DOMContentLoaded', function() {
    const includes = document.querySelectorAll('[data-include]');
    
    Array.from(includes).forEach(async (include) => {
        try {
            const file = include.getAttribute('data-include');
            const response = await fetch(file);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            include.insertAdjacentHTML('afterend', html);
            include.remove();
            
        } catch (error) {
            console.error(`Error cargando ${file}:`, error);
            include.innerHTML = `<p class="text-red-500">Error cargando la sección: ${error.message}</p>`;
        }
    });
});