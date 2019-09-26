# defineAction

`defineAction<TActionData>` - allows to define a simple action creator
which produces actions with specified props.

```
const MyAction = defineAction<{ value: number; }>("MY ACTION");
```

Now action creator could be used for creating actions:

```
const actionInstance = MyAction({ value: 123 });
console.log(actionInstance.value); // Outputs 123
```

Also action creator could be used for checking actions for conforming a type:

```
const action: Action = ...
if (MyAction.is(action)) {
    console.log(action.value); // action variable type now shrinked to { type: string; value: number }
}
```