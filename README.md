# react-apollo-autosave
A React component that allows for editing and autosave behavior, combining an Apollo Query and Mutation. With the query, you retrieve the data that you want to edit from your backend. The mutation updates it. Internally, the component maintains a local copy of the data so that you can directly couple properties of the data to React props. As a result, you don't need to create variables inside your component state for this.

## Installation 
```sh
npm install react-apollo-autosave --save
```

## Example
```typescript
import { EditorAutosave } from 'react-apollo-autosave';

// GraphQL query and mutation for reading and updating a user's name
const getUser = gql`
    query User($id: ID!) {
        user(id: $id) {
            id
            name
        }
    }
`;

const updateUser = gql`
    mutation UpdateUser($id: ID!, $input: UserInput!) {
        updateUser(id: $id, input: $input) {
            id
            name
        }
    }
`;

// A simple React component that shows an input where you can edit a user's name
class MyReactComponent {
    render() {
        const id = "someUser";
        return <EditorAutosave
            query={getUser}            // the query to perform to retrieve the data
            variables={{ id }}         // variables passed to the query
            mutation={updateUser}      // the mutation to perform to update the data
            mutateOnUpdate={true}      // automatically perform the mutate when the update function is called
        >
            {({ update, mutate, queryResult: { loading, error, data } }) => {
                // deal with loading and error cases
                if (loading) { return null; }
                if (error) { return error.message; }
                
                // retrieve the user information from the query result
                const user = data.user;
                
                // render the input
                return <input type="text" value={user.name} onChange={(event) => {
                    // create the object containing the changed user name
                    const input = {
                        name: event.target.value
                    };
                    
                    // only strings with length > 0 are a valid username
                    const nameIsValid = input.name.length > 0;

                    // Call the update function. The first parameter contains the new local
                    // data (should be the same structure as the query result). The second parameter
                    // contains the information needed to perform the mutation. The third parameter
                    // overrides the mutateOnUpdate value. In this case, the mutation will not be
                    // performed if the user name is not valid, but the local data will be updated so that
                    // the contents of the input element changes when the user types something.
                    update({ user: input }, { variables: { id, input } }, nameIsValid);
                }}>;
            }
        </EditorAutosave>
    }
}
```

## Features

### Autosaving changes
Whenever you change the value that the editor component controls, you call the `update` method, which updates the local data. The component then automatically calls the mutate function (resulting in the autosave behavior). The component uses the lodash `throttle` function to reduce the number of queries to the backend. You can set the throttle wait time and whether the throttle is leading or trailing by changing the `waitTime` (default 3000 ms) and `throttleType` (default "leading") properties.

### Explicit saving
You can also explicitly call the mutate function, and switch off autosave by setting the `mutateOnUpdate` prop to `false`. This way, you can still use the local copy of the data and do an explicit save when the user presses a button.

### Combining with validation
In case of an invalid input, normally you don't want to sync the changes to the backend, but you do want to change the local data, otherwise the user will not be able to see what (s)he is typing/clicking on. To support validation, you can override whether a mutation should happen when you call the `update` function.
