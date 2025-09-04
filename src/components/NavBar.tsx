import Link from "next/link";
import styles from "./NavBar.module.css";

type NavBarProps = {
  leftText?: string;
  rightLinks?: { href: string; label: string }[];
};

const NavBar: React.FC<NavBarProps> = ({ leftText = "Track Bills", rightLinks }) => (
  <nav className={styles.navbar}>
    <div className={styles.navText}>{leftText}</div>
    <div className={styles.navLinks}>
      {rightLinks?.map((link) => (
        <Link key={link.href} href={link.href} className={styles.navLink}>
          {link.label}
        </Link>
      ))}
    </div>
  </nav>
);

export default NavBar;