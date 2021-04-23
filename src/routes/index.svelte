<script context="module" type="ts">
  import TaskItem from "./../components/TaskItem.svelte";
  import {
    GET_TASKS,
    ADD_TASK,
    SUB_GET_TASKS,
    DEL_TASK,
    UPDATE_TASK,
  } from "./../modules/queries";
  import { operationStore, subscription, setClient } from "@urql/svelte";
  import { auth, googleProvider } from "../modules/firebase";
  import Profile from "./../components/Profile.svelte";

  import client from "../modules/urql";

  export async function preload() {
    const dgTask = await client.query(GET_TASKS).toPromise();
    return { dgTask: dgTask.data?.queryTask };
  }

  interface User {
    displayName: string;
    photoURL: string;
    uid: string;
    email: string;
  }
</script>

<script type="ts">
  export let dgTask: any[];

  let user: User;

  // Form Text
  let text = "some task";

  auth.onAuthStateChanged((u: any) => {
    user = u;
  });

  if ((process as any).browser) {
    setClient(client);
    const getTasks = operationStore(SUB_GET_TASKS);
    subscription(getTasks).subscribe((r: any) => {
      dgTask = r.data ? r.data?.queryTask : [];
    });
  }

  async function add() {
    await client
      .mutation(ADD_TASK, {
        task: {
          title: text,
          completed: false,
          user: { email: user.email },
        },
      })
      .toPromise()
      .then((r: any) => {
        if (r.error) {
          console.log(r.error);
        }
      });
    text = "";
  }

  async function remove(event: any) {
    const { id } = event.detail;

    await client
      .mutation(DEL_TASK, {
        id: [id],
      })
      .toPromise()
      .then((r: any) => {
        if (r.error) {
          console.log(r.error);
        }
      });
  }

  async function update(event: any) {
    const { id, newStatus } = event.detail;
    await client
      .mutation(UPDATE_TASK, {
        id: id,
        completed: newStatus,
      })
      .toPromise()
      .then((r: any) => {
        if (r.error) {
          console.log(r.error);
        }
      });
  }

  const onKeyPress = (e: any) => {
    if (e.charCode === 13) add();
  };
</script>

<svelte:head>
  <title>Dgraph Sapper URQL</title>
</svelte:head>

<h1>Dgraph Sapper URQL</h1>

<section>
  {#if user}
    <Profile
      displayName={user.displayName}
      photoURL={user.photoURL}
      uid={user.uid}
    />
    <button on:click={() => auth.signOut()}>Logout</button>
    <ul>
      {#each dgTask as task (task.id)}
        <li>
          <TaskItem
            id={task.id}
            text={task.title}
            completed={task.completed}
            on:remove={remove}
            on:toggle={update}
          />
        </li>
      {/each}
    </ul>

    <input bind:value={text} on:keypress={onKeyPress} />
    <button on:click={add}>Add Task</button>
  {:else}
    <button on:click={() => auth.signInWithPopup(googleProvider)}
      >Signin with Google</button
    >
  {/if}
</section>
