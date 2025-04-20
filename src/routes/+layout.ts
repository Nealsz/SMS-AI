import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ url }: { url: URL }) => {
    const path = url.pathname;
    let activePage = 'home';
    
    if (path.startsWith('/students')) {
        activePage = 'students';
    } else if (path.startsWith('/summary')) {
        activePage = 'summary';
    }
    
    return {
        activePage
    };
}; 