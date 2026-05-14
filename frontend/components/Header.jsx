import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaThLarge, FaFolder } from "react-icons/fa";
import styles from "../styles/Header.module.css";
import { LogOut } from "lucide-react";


export default function Header() {
    const router = useRouter();
    const [initials, setInitials] = useState("AD");

    const isDashboard = router.pathname === "/dashboard";
    const isProjects =
        router.pathname === "/projects" || router.pathname.startsWith("/projects/");
    async function handleLogout() {
        await fetch("/api/logout", {
            method: "POST",
        });

        router.push("/connexion");
    }
    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await fetch("/api/profile");
                const data = await res.json().catch(() => ({}));

                if (!res.ok) return;

                const name = data?.data?.user?.name || "";

                if (!name.trim()) {
                    setInitials("??");
                    return;
                }

                const computedInitials = name
                    .trim()
                    .split(/\s+/)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                setInitials(computedInitials || "??");
            } catch (error) {
                console.error("Erreur profil header:", error);
            }
        }

        loadProfile();
    }, []);

    return (
        <header className={styles.header}>
            <Link href="/dashboard" className={styles.logo}>
                ABRICOT
            </Link>

            <nav className={styles.nav}>
                <Link
                    href="/dashboard"
                    className={`${styles.navItem} ${isDashboard ? styles.active : ""}`}
                >
                    <FaThLarge className={styles.icon} />
                    <span>Tableau de bord</span>
                </Link>

                <Link
                    href="/projects"
                    className={`${styles.navItem} ${isProjects ? styles.active : ""}`}
                >
                    <FaFolder className={styles.icon} />
                    <span>Projects</span>
                </Link>
            </nav>

            <div className={styles.rightActions}>
                <button
                    type="button"
                    className={styles.logoutButton}
                    onClick={handleLogout}
                    aria-label="Se déconnecter"
                >
                    <LogOut size={18} aria-hidden="true" />
                    <span>Déconnexion</span>
                </button>

                <Link href="/profile" className={styles.avatar} aria-label="Accéder au profil">
                    {initials}
                </Link>
            </div>
        </header>
    );
}
