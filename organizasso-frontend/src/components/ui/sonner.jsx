import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";
import styles from './styles/sonner.module.css'; // Import CSS module

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <div className={styles.toasterWrapper}>
      <Sonner
        theme={theme}
        {...props} />
    </div>
  );
}

export { Toaster }
