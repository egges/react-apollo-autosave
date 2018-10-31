import React = require("react");
import { DocumentNode } from "graphql";
import { QueryProps, QueryResult, OperationVariables, MutationProps, MutationResult, MutationOptions } from "react-apollo";
import { ApolloError } from "apollo-client";
/** Signature of the update function which updates the local data and optionally commits the update to the backend. */
export declare type UpdateFunction = (data?: any, options?: MutationOptions, mutate?: boolean) => void;
/** Object of arguments passed to the editor render prop. */
export interface EditorAutosaveRenderArgs {
    /** The result of the initial query. */
    queryResult: QueryResult;
    /** The result of any subsequent mutation. */
    mutationResult: MutationResult;
    /** Change handler that updates the local data and optionally commits the update to the backend (overriding the value of mutateOnUpdate). */
    update: UpdateFunction;
}
/** Editor component properties. */
export interface EditorAutosaveProps {
    /** GraphQL query. This overrides the query field in the queryProps object. */
    query?: DocumentNode;
    /** Variables needed for the query. This overrides the variables field in the queryProps object. */
    queryVariables?: OperationVariables;
    /** Additional properties for the query. */
    queryProps?: Partial<QueryProps>;
    /** GraphQL mutation. This overrides the mutation field in the mutationProps object. */
    mutation?: DocumentNode;
    /** Callback for when the mutation has completed successfully. This performs the same function as the onCompleted callback function in the mutationProps object. */
    mutationOnCompleted?: (data: any) => void;
    /** Callback for when the mutation resulted in an error. This performs the same function as the onError callback function in the mutationProps object. */
    mutationOnError?: (error: ApolloError) => void;
    /** Additional properties for the mutation. */
    mutationProps?: Partial<MutationProps>;
    /** Render property, with results and update functions. */
    children: (args: EditorAutosaveRenderArgs) => React.ReactNode;
    /** The time to wait between mutations in ms (default 3000). */
    waitTime?: number;
    /** Whether to commit an update automatically to the backend when local data is changed (default true). */
    mutateOnUpdate?: boolean;
    /** Callback for local data changes. */
    onUpdate?: () => void;
    /** When to run the first save: immediately (default) or after the wait. */
    throttleType?: "leading" | "trailing";
}
/**
 * Component handling editing fields and syncing with the database, including an autosave using Apollo GraphQL queries and mutations.
 * @class EditorAutosave
 */
export declare class EditorAutosave extends React.Component<EditorAutosaveProps> {
    /** Default prop values. */
    static defaultProps: {
        queryProps: {};
        mutationProps: {};
        waitTime: number;
        mutateOnUpdate: boolean;
        throttleType: string;
    };
    /** Local copy of the query result data. */
    private localData;
    /** Throttled version of mutation function. */
    private throttledMutate;
    /** Place to accumulate options while waiting */
    private mergedOptions;
    /** Creates the throttled mutation function if needed. */
    private initMutate;
    /** Merges two objects but overwrites arrays. */
    private merge;
    /** Updates the local data, triggers a render, and performs a mutation. */
    private update;
    /** Handles updating local data. */
    private handleUpdateLocalData;
    /** Handles performing a mutation. */
    private handleMutate;
    render(): JSX.Element;
}
