import './contact-form.css';
import { createApp } from 'vue';
import ContactForm from './ContactForm';

function parsePropsFrom(el: HTMLElement): any {
    const script = el.querySelector('script[type="application/json"][data-config]') as HTMLScriptElement | null;
    if (!script) {
        return {
            title: el.getAttribute('data-title') || undefined,
            subtitle: el.getAttribute('data-subtitle') || undefined,
            submitText: el.getAttribute('data-submit-text') || undefined,
            formAction: el.getAttribute('data-form-action') || undefined,
            formMethod: el.getAttribute('data-form-method') || undefined,
        };
    }
    try {
        return JSON.parse(script.textContent || '{}');
    } catch {
        return {};
    }
}

function mountInto(el: HTMLElement) {
    const props = parsePropsFrom(el);
    const app = createApp(ContactForm, props);
    app.mount(el);
}

function mountAll() {
    document.querySelectorAll('[data-component="contact-form"]').forEach((el) => mountInto(el as HTMLElement));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
} else {
    mountAll();
}

document.addEventListener('componentLoaded' as any, (e: Event) => {
    const evt = e as CustomEvent<{ componentName?: string; target?: HTMLElement }>;
    const base = String(evt.detail?.componentName || '').replace('-loader.html', '').replace('.html', '');
    if (base !== 'contact-form') return;
    if (evt.detail?.target) mountInto(evt.detail.target);
});
