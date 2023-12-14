import {
  DatabaseType,
  useAddDatabaseConnectionMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import useSetState from "@hooks/useSetState";
import { maybeDatabase, maybeSchema } from "@lib/urls";
import { useRouter } from "next/router";
import { Dispatch, SyntheticEvent } from "react";

const defaultState = {
  name: "",
  host: "",
  port: "3306",
  username: "root",
  password: "",
  database: "",
  schema: undefined as string | undefined,
  connectionUrl: "",
  hideDoltFeatures: false,
  useSSL: true,
  showAdvancedSettings: false,
  loading: false,
  type: DatabaseType.Mysql,
};

type ConfigState = typeof defaultState;
type ConfigDispatch = Dispatch<Partial<ConfigState>>;

type ReturnType = {
  onSubmit: (e: SyntheticEvent) => Promise<void>;
  state: ConfigState;
  setState: ConfigDispatch;
  error?: Error | undefined;
  clearState: () => void;
};

export default function useConfig(): ReturnType {
  const router = useRouter();
  const [state, setState] = useSetState(defaultState);
  const { mutateFn, ...res } = useMutation({
    hook: useAddDatabaseConnectionMutation,
  });
  const clearState = () => {
    setState(defaultState);
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setState({ loading: true });

    try {
      const db = await mutateFn({
        variables: {
          name: state.name,
          connectionUrl: getConnectionUrl(state),
          hideDoltFeatures: state.hideDoltFeatures,
          useSSL: state.useSSL,
          type: state.type,
          schema: state.schema,
        },
      });
      await res.client.clearStore();
      if (!db.data) {
        return;
      }
      const { href, as } =
        state.type === DatabaseType.Mysql
          ? maybeDatabase(db.data.addDatabaseConnection.currentDatabase)
          : maybeSchema(db.data.addDatabaseConnection.currentSchema);
      await router.push(href, as);
    } catch (_) {
      // Handled by res.error
    } finally {
      setState({ loading: false });
    }
  };

  return { onSubmit, state, setState, error: res.err, clearState };
}

function getConnectionUrl(state: ConfigState): string {
  if (state.connectionUrl) return state.connectionUrl;
  const prefix = state.type === DatabaseType.Mysql ? "mysql" : "postgresql";
  return `${prefix}://${state.username}:${state.password}@${state.host}:${state.port}/${state.database}`;
}

export function getCanSubmit(state: ConfigState): boolean {
  if (!state.name) return false;
  if (state.connectionUrl) return true;
  if (!state.host || !state.username) return false;
  return true;
}
