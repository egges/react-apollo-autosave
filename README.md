# react-apollo-autosave
A React component that allows for editing and autosave behavior, combining an Apollo Query and Mutation.

## Installation 
```sh
npm install react-apollo-autosave --save
yarn add react-apollo-autosave
bower install react-apollo-autosave --save
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
        updateGroup(id: $id, input: $input) {
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
            query={getUser}
            variables={{ id }}
            mutation={updateUser}
        >
            {({ update, mutate, queryResult: { loading, error, data } }) => {
                if (loading) { return null; }
                if (error) { return `Error!: ${error.message}`; }

                const user = data.user;
                return <input type="text" value={user.name} onChange={(event) => {
                    const input = {
                        name: event.target.value
                    };

                    update({ user: input }, { variables: { id, input } });
                }}>;
            }
        </EditorAutosave>
    }
}
```
