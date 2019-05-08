<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.name" placeholder="名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getTasks">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="tasks" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;"  :row-class-name="table_row__class">
            <el-table-column prop="uid" label="用户" width="120" sortable>
            </el-table-column>
            <el-table-column prop="name" label="名称" width="240" sortable>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120" :formatter="status_info" sortable>
            </el-table-column>
            <el-table-column prop="command" label="命令" width="360" sortable>
            </el-table-column>
            <el-table-column prop="cron" label="执行计划" width="120" sortable>
            </el-table-column>
            <el-table-column prop="descript" label="描述" min-width="240" sortable>
            </el-table-column>

            <el-table-column label="操作" width="280">
                <template slot-scope="scope">
                    <el-button type="success" size="small" :disabled="status_boolean(scope.row.status)"
                               @click="handleEnable(scope.$index, scope.row)">启用
                    </el-button>
                    <el-button type="primary" size="small" @click="handleUpload(scope.$index, scope.row)">更新包
                    </el-button>
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="12"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--上传界面-->
        <el-dialog title="上传" v-model="uploadFormVisible" :close-on-click-modal="true" width="20%" @close="afterUpload">
            <ul>
                <li v-for="(file, index) in files" :key="file.id">
                    <span>{{file.name}}</span>
                    <span>{{file.size | formatSize1}}MB</span>
                    <span v-if="file.error">{{file.error}}</span>
                    <span v-else-if="file.success">success</span>
                    <span v-else-if="file.active">uploading</span>
                    <span v-else-if="file.active">uploading</span>
                    <span v-else></span>
                </li>
            </ul>
            <file-upload
                    class="btn btn-primary"
                    :post-action="uploadpath"
                    accept="application/zip"
                    v-model="files"
                    @input-filter="inputFilter"
                    @input-file="inputFile"
                    ref="upload">
                <i class="fa fa-plus"></i>
                选择文件
            </file-upload>
            <el-button size="small" class="fa fa-arrow-up" v-if="!$refs.upload || !$refs.upload.active"
                       @click.prevent="$refs.upload.active = true" style="margin-left:70%">
                上传
            </el-button>
        </el-dialog>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="true">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="命令" prop="command">
                    <el-input v-model="editForm.command" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="执行计划" prop="cron">
                    <el-input v-model="editForm.cron" auto-complete="off"></el-input>
                </el-form-item>
                <!--				<el-form-item label="立即生效">-->
                <!--					<el-checkbox v-model="editForm.status_use" checked >启用</el-checkbox>-->
                <!--				</el-form-item>-->
                <el-form-item label="描述">
                    <el-input type="textarea" v-model="editForm.descript"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false,editLoading=false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="true" @close="clear_next_times">
            <el-form :model="addForm" :rules="addFormRules" ref="addForm" label-width="80px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="命令" prop="command">
                    <el-input v-model="addForm.command" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="执行计划" prop="cron"  >
                    <el-input v-model="addForm.cron" placeholder="0 0 8 * * ?" clearable></el-input>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input type="textarea" v-model="addForm.descript"></el-input>
                </el-form-item>
            </el-form>
            <div v-show="next5Visible">
                <div class="text item">近期执行时间</div>
                <div v-for="item in next5Times" :key="item" class="text item">
                    {{item }}
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false,addLoading=false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<style>
    .el-table .unused-row {
        /*background: gray;*/
    }

    .el-table .used-row {
        background: #f0f9eb;
    }
    .text {
        font-size: 14px;
    }
    .item {
        margin-bottom: 12px;
        margin-left: 80px;
    }

</style>

<script>
    import FileUpload from 'vue-upload-component'
    import util from '../../common/js/util'
    //import NProgress from 'nprogress'
    import {getUserListPage, removeUser, batchRemoveUser, editTask, addTask,enableTask,cronTime} from '../../api/api';

    export default {
        components: {
            FileUpload,
        },
        filters: {
            formatSize1(size) {
                return Math.round(size / 1000 / 1000)
            }
        },
        data() {
            var check_add_cronTime = (rule, value, callback) => {
                    if (!this.addForm.cron) {
                        return callback(new Error('cron不能为空'));
                    }
                    setTimeout(() => {
                        let para = {
                            cron: this.addForm.cron
                        };
                        cronTime(para).then(res => {
                            let {code, data} = res.data
                            if (code === 200) {
                                this.next5Times = data
                                this.next5Visible = true
                                callback()
                            }
                            else{
                                callback(new Error('cron表达式错误'))
                            }
                        });
                    }, 300);
            };
            return {
                filters: {
                    name: ''
                },
                tasks: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列
                uploadFormVisible: false,
                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    name: [
                        {required: true, message: '名称为空', trigger: 'blur'}
                    ],
                    command: [
                        {required: true, message: '执行命令为空', trigger: 'blur'}
                    ],
                    cron: [
                        {required: true, message: '执行计划为空', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                editForm: {
                    id: 0,
                    name: '',
                    command: '',
                    cron: '',
                    descript: ' ',
                    status_use: true
                },
                uploadForm: {
                    id: 0,
                    name: ''
                },
                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    name: [
                        {required: true, message: '名称为空', trigger: 'blur'}
                    ],
                    command: [
                        {required: true, message: '执行命令为空', trigger: 'blur'}
                    ],
                    cron: [
                        {validator: check_add_cronTime, trigger: 'blur'}
                    ]
                },
                //新增界面数据
                addForm: {
                    name: '',
                    command: '',
                    cron: '',
                    status: 1,
                    descript: ' '
                },
                files: [],
                next5Times: [],
                next5Visible: false
            }
        },
        methods: {
            //性别显示转换
            formatSex: function (row, column) {
                return row.sex === 1 ? '男' : row.sex == 0 ? '女' : '未知';
            },
            status_boolean: function (status) {
                return status === 0
            },
            status_info: function (row, column) {
                if (row.status === 0)
                    return '已启用'
                else
                    return '未启用'
            },
            table_row__class(row, rowIndex) {
                if (row.status === 0) {
                    return 'used-row';
                } else {
                    return 'unused-row';
                }
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getTasks();
            },
            //获取任务列表
            getTasks() {
                let para = {
                    pageNum: this.page,
                    partName: this.filters.name
                };
                this.listLoading = true;
                //NProgress.start();
                getUserListPage(para).then((res) => {
                    this.total = res.data.total;
                    this.tasks = res.data.tasks;
                    this.listLoading = false;
                    //NProgress.done();
                });
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {id: row.id};
                    removeUser(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getTasks();
                    });
                }).catch(() => {

                });
            },
            //显示上传界面
            handleUpload: function (index, row) {
                this.uploadFormVisible = true;
                this.uploadForm = Object.assign({}, row);
            },
            afterUpload() {
                this.files = []
            },
            clear_next_times(){
                this.next5Times=[]
                this.next5Visible=false
            },
            inputFilter(newFile, oldFile, prevent) {
                if (newFile && !oldFile) {
                    // Before adding a file
                    // 添加文件前
                    // Filter system files or hide files
                    // 过滤系统文件 和隐藏文件
                    if (/(\/|^)(Thumbs\.db|desktop\.ini|\..+)$/.test(newFile.name)) {
                        return prevent()
                    }
                    // Filter php html js file
                    // 过滤 php html js 文件
                    if (/\.(php5?|html?|jsx?)$/i.test(newFile.name)) {
                        return prevent()
                    }
                }
            },
            inputFile(newFile, oldFile) {
                if (newFile && !oldFile) {
                    // add
                    console.log('add', newFile)
                }
                if (newFile && oldFile) {
                    // update
                    console.log('update', newFile)
                }
                if (!newFile && oldFile) {
                    // remove
                    console.log('remove', oldFile)
                }
            },
            handleEnable:function(index,row){
                this.$confirm('确认启用吗？', '提示', {}).then(() => {
                    //如果para.status是true，则保留原样，即要么0启用，要么１　启用无依赖包
                    enableTask(row.id).then(res => {
                        let {code,msg,status} = res.data
                        if (code !== 200) {
                            this.$message({
                                message: msg,
                                type: 'error'
                            });
                        } else if(status ==1){
                            this.$message({
                                message: '未上传包',
                                type: 'warning'
                            });
                        }else{
                            this.$message({
                                message: '启用成功',
                                type: 'success'
                            });
                            this.getTasks();
                        }
                    });
                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editForm = Object.assign({}, row);
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addForm = {
                    name: '',
                };
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.editForm);
                            //如果para.status是true，则保留原样，即要么0启用，要么１　启用无依赖包
                            para.status = (para.status_use === true) ? para.status : 2;
                            editTask(para).then(res => {
                                let {code, msg} = res.data
                                if (code !== 200) {
                                    this.$message({
                                        message: msg,
                                        type: 'error'
                                    });
                                } else {
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.$refs['editForm'].resetFields();
                                    this.editFormVisible = false;
                                    this.getTasks();
                                }
                                this.editLoading = false
                            });
                        });
                    }
                });
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.addForm);
                            para.status = (para.status === true) ? 1 : 2;
                            addTask(para).then(res => {
                                let {code, msg} = res.data
                                if (code !== 200) {
                                    this.$message({
                                        message: msg,
                                        type: 'error'
                                    });
                                } else {
                                    //NProgress.done();
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.$refs['addForm'].resetFields();
                                    this.addFormVisible = false;
                                    this.getTasks();
                                }
                                this.addLoading = false
                            });
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {ids: ids};
                    batchRemoveUser(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getTasks();
                    });
                }).catch(() => {

                });
            }
        },
        computed: {
            uploadpath() {
                // `this` 指向 vm 实例
                return '/upload/tasklib/' + this.uploadForm.id
            }
        },
        mounted() {
            this.getTasks();
        }
    }

</script>

<style scoped>

</style>
