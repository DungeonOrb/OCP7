import styles from "../styles/Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <span className={styles.brand}>Abricot</span>
            <span className={styles.text}>Abricot 2025</span>
        </footer>
    );
}