// Templates remount on every navigation, so the incoming page fades in (see .route-fade).
export default function Template({ children }) {
  return <div className="route-fade">{children}</div>;
}
