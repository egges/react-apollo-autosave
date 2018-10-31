import React = require("react");
import { DocumentNode } from "graphql";
import {
    Query, QueryProps, QueryResult,
    OperationVariables, Mutation, MutationProps,
    MutationResult, MutationFn, MutationOptions
} from "react-apollo";
import { ApolloError } from "apollo-client";
import { mergeWith, cloneDeep, throttle, isArray } from "lodash";

/** Signature of the update function which updates the local data and optionally commits the update to the backend. */
export type UpdateFunction = (data?: any, options?: MutationOptions, mutate?: boolean) => void;

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
export class EditorAutosave extends React.Component<EditorAutosaveProps> {

    /** Default prop values. */
    public static defaultProps = {
        queryProps: {},
        mutationProps: {},
        waitTime: 3000,
        mutateOnUpdate: true,
        throttleType: "leading"
    };

    /** Local copy of the query result data. */
    private localData: any = null;
    /** Throttled version of mutation function. */
    private throttledMutate: MutationFn | null = null;
    /** Place to accumulate options while waiting */
    private mergedOptions: MutationOptions = {};

    /** Creates the throttled mutation function if needed. */
    private initMutate = (mutate: MutationFn) => {
        if (this.throttledMutate) {
            return;
        }
        const { waitTime, throttleType } = this.props;

        // Define throttle type
        const throttleOptions = { trailing: true, leading: true };
        if (throttleType === "trailing") {
            throttleOptions.leading = false;
        }

        this.throttledMutate = throttle(async (options?: MutationOptions) => {
            try {
                // Run the mutation
                const result = await mutate(options);
                // Clear accumulated options
                this.mergedOptions = {};
                return result;
            } catch (error) {
                // Catch, log, and discard errors since there might not be an error handler due to the
                // throttled function call.
                console.log(error);
            }
        }, waitTime, throttleOptions);
    }

    /** Merges two objects but overwrites arrays. */
    private merge = (obj1: any, obj2: any) => {
        const customizer = (objValue: any, srcValue: any) => {
            if (isArray(objValue)) {
                return srcValue;
            }
        }
        return mergeWith(obj1, obj2, customizer);
    }

    /** Updates the local data, triggers a render, and performs a mutation. */
    private update = async (data?: any, options?: MutationOptions, mutate?: boolean) => {
        // Handle updating local data
        if (data) {
            this.handleUpdateLocalData(data);
        }
        // Handle mutation
        const shouldMutate = mutate === undefined || mutate === null ? this.props.mutateOnUpdate : mutate;
        if (shouldMutate) {
            return this.handleMutate(options);
        }
    }

    /** Handles updating local data. */
    private handleUpdateLocalData = (data: any) => {
        const { onUpdate } = this.props;
        this.merge(this.localData, data);
        // Callback
        if (onUpdate) { onUpdate(); }
        // Render
        this.forceUpdate();
    }

    /** Handles performing a mutation. */
    private handleMutate = (options?: MutationOptions) => {
        if (options) {
            // Merge options with any previous calls to make sure every input is sent,
            // and not only the last one
            this.merge(this.mergedOptions, options);
        }
        if (!this.throttledMutate) {
            // this should never happen, but the check is here for safety
            return;
        }
        return this.throttledMutate(this.mergedOptions);
    }

    public render() {
        const { query, mutation, mutationOnCompleted, mutationOnError, queryVariables, children } = this.props;
        let { queryProps, mutationProps } = this.props;

        // Override query and query variables
        queryProps = queryProps || {};
        queryProps.query = query || queryProps.query;
        queryProps.variables = queryVariables || queryProps.variables;

        // Override mutation and store onCompleted to call later
        mutationProps = mutationProps || {};
        mutationProps.mutation = mutation || mutationProps.mutation;

        return <Query {...queryProps as QueryProps}>
            {(queryResult) => {
                const { loading, data } = queryResult;

                if (this.localData) {
                    // Use local data instead of (cached) query result
                    queryResult.data = this.localData;
                } else if (!loading && data) {
                    // First run: create the local copy
                    this.localData = cloneDeep(data);
                }

                return <Mutation
                    {...mutationProps as MutationProps}
                    onCompleted={(data) => {
                        // Call the onCompleted function provided by the user of the component
                        if (mutationOnCompleted) {
                            mutationOnCompleted(data);
                        }
                        // Call the original onCompleted method from the props
                        if (mutationProps && mutationProps.onCompleted) {
                            mutationProps.onCompleted(data);
                        }
                    }}
                    onError={(error) => {
                        // Reset the local data from the query
                        this.localData = cloneDeep(data);
                        // Call the onError function provided by the user of the component
                        if (mutationOnError) {
                            mutationOnError(error);
                        }
                        // Call the original onError method from the props
                        if (mutationProps && mutationProps.onError) {
                            mutationProps.onError(error);
                        }
                    }}>
                    {(mutate, mutationResult) => {
                        // Verify that the throttled mutate function was created
                        this.initMutate(mutate);

                        // Call the render prop
                        return children({
                            queryResult, mutationResult,
                            update: this.update
                        });
                    }}
                </Mutation>;
            }}
        </Query>;
    }
}
