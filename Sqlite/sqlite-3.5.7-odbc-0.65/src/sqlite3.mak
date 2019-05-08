# VC++ 6.0 Makefile for SQLite 3.2.7                      -*- Makefile -*-
#
# You need to get hold of a copy of awk. There are native Windows versions
# available. This script was developed with GNU awk 3.0.3
#

#### The toplevel directory of the source tree.  This is the directory
#    that contains this "Makefile.in" and the "configure.in" script.

ROOT    = sqlite3
SRCDIR  = $(ROOT)\src
TOOLDIR = $(ROOT)\tool

!ifndef DEBUG
DEBUG = 0
!endif DEBUG
!ifndef PROFILE
PROFILE = 0
!endif
!ifndef SYMBOLS
SYMBOLS = 0
!endif

#### Leave MEMORY_DEBUG undefined for maximum speed.  Use MEMORY_DEBUG=1
#    to check for memory leaks.  Use MEMORY_DEBUG=2 to print a log of all
#    malloc()s and free()s in order to track down memory leaks.
#    
#    SQLite uses some expensive assert() statements in the inner loop.
#    You can make the library go almost twice as fast if you compile
#    with -DNDEBUG=1

#OPTS = -DMEMORY_DEBUG=2
#OPTS = -DMEMORY_DEBUG=1
OPTS = 

!if $(DEBUG)
OUTDIR =Debug
CFLAGS =-Od -Zi -GZ -MDd -D_DEBUG
LDFLAGS=-debug:full -debugtype:cv
!else
OUTDIR =Release
!if $(SYMBOLS)
CFLAGS =-Od -Zi -Op -Gs -MD -DNDEBUG=1
LDFLAGS=-debug -opt:ref -opt:icf,3
!else
CFLAGS =-O1 -Op -Gs -MD -DNDEBUG=1
LDFLAGS=-release -opt:ref -opt:icf,3
!endif
!endif

!if $(PROFILE)
CFLAGS =$(CFLAGS) -Zi
LDFLAGS=$(LDFLAGS) -profile -map
!endif

TMPDIR =$(OUTDIR)\Objects
TMPSRC =$(OUTDIR)\Generated
FTS1SRC=$(ROOT)\ext\fts1
FTS2SRC=$(ROOT)\ext\fts2
FTS3SRC=$(ROOT)\ext\fts3

CC     =cl -nologo
LD     =link -nologo
AR     =lib -nologo
AWK    =awk
COPY   =copy
RMDIR  =rmdir /s /q

#-Fd$(TARGET:.dll=.pdb)
CFLAGS =$(CFLAGS) -W0 -GX -YX -Fp$(TMPDIR)^\
INC    =-I$(SRCDIR) -I$(TMPSRC)
DEFS   =-D_WIN32 -DOS_WIN=1

BCC  =$(CC) $(CFLAGS) $(DEFS)
TCC  =$(CC) $(CFLAGS) $(DEFS)
TCCX =$(TCC) $(OPTS) $(INC) -DWIN32=1 -DTHREADSAFE=1 -DOS_WIN=1
TCCXD = $(TCCX) -D_DLL

#-------------------------------------------------------------------------
# Object files for the SQLite library.
#
LIBOBJ = \
	$(TMPDIR)\alter.obj \
	$(TMPDIR)\analyze.obj \
	$(TMPDIR)\attach.obj \
	$(TMPDIR)\auth.obj \
	$(TMPDIR)\bitvec.obj \
	$(TMPDIR)\btmutex.obj \
	$(TMPDIR)\btree.obj \
	$(TMPDIR)\build.obj \
	$(TMPDIR)\callback.obj \
	$(TMPDIR)\complete.obj \
	$(TMPDIR)\date.obj \
        $(TMPDIR)\delete.obj \
	$(TMPDIR)\expr.obj \
	$(TMPDIR)\fault.obj \
	$(TMPDIR)\func.obj \
	$(TMPDIR)\hash.obj \
	$(TMPDIR)\insert.obj \
	$(TMPDIR)\journal.obj \
	$(TMPDIR)\loadext.obj \
	$(TMPDIR)\main.obj \
	$(TMPDIR)\malloc.obj \
	$(TMPDIR)\mem1.obj \
	$(TMPDIR)\mem2.obj \
	$(TMPDIR)\mem3.obj \
	$(TMPDIR)\mem4.obj \
	$(TMPDIR)\mem5.obj \
	$(TMPDIR)\mutex.obj \
	$(TMPDIR)\mutex_os2.obj \
	$(TMPDIR)\mutex_unix.obj \
	$(TMPDIR)\mutex_w32.obj \
	$(TMPDIR)\opcodes.obj \
	$(TMPDIR)\os.obj \
	$(TMPDIR)\os_os2.obj \
	$(TMPDIR)\os_unix.obj \
	$(TMPDIR)\os_win.obj \
	$(TMPDIR)\pager.obj \
	$(TMPDIR)\parse.obj \
	$(TMPDIR)\pragma.obj \
	$(TMPDIR)\prepare.obj \
	$(TMPDIR)\printf.obj \
	$(TMPDIR)\random.obj \
	$(TMPDIR)\select.obj \
	$(TMPDIR)\table.obj \
	$(TMPDIR)\tokenize.obj \
	$(TMPDIR)\trigger.obj \
	$(TMPDIR)\update.obj \
        $(TMPDIR)\util.obj \
	$(TMPDIR)\vacuum.obj \
	$(TMPDIR)\vdbe.obj \
	$(TMPDIR)\vdbeapi.obj \
	$(TMPDIR)\vdbeaux.obj \
	$(TMPDIR)\vdbeblob.obj \
	$(TMPDIR)\vdbefifo.obj \
	$(TMPDIR)\vdbemem.obj \
	$(TMPDIR)\where.obj \
	$(TMPDIR)\utf.obj \
	$(TMPDIR)\legacy.obj \
	$(TMPDIR)\vtab.obj

HDR = \
	$(TMPSRC)\sqlite3.h  \
	$(SRCDIR)\btree.h \
	$(SRCDIR)\btreeInt.h \
	$(SRCDIR)\hash.h \
	$(SRCDIR)\sqliteLimit.h \
	$(SRCDIR)\mutex.h \
	$(TMPSRC)\opcodes.h \
	$(SRCDIR)\os.h \
	$(SRCDIR)\os_common.h \
	$(SRCDIR)\sqlite3ext.h \
	$(SRCDIR)\sqliteInt.h  \
	$(SRCDIR)\vdbe.h  \
	$(SRCDIR)\vdbeInt.h  \
	$(TMPSRC)\parse.h \
	$(TMPSRC)\config.h

# Header files used by the VDBE submodule

VDBEHDR = $(HDR) $(SRCDIR)/vdbeInt.h

EXTOBJ = $(TMPDIR)\icu.obj

FTS2OBJ= \
	$(TMPDIR)\fts2.obj \
	$(TMPDIR)\fts2_hash.obj \
	$(TMPDIR)\fts2_icu.obj \
	$(TMPDIR)\fts2_porter.obj \
	$(TMPDIR)\fts2_tokenizer.obj \
	$(TMPDIR)\fts2_tokenizer1.obj

FTS2HDR= $(HDR) \
	$(FTS2SRC)\fts2.h \
	$(FTS2SRC)\fts2_hash.h \
	$(FTS2SRC)\fts2_tokenizer.h

FTS3OBJ= \
	$(TMPDIR)\fts3.obj \
	$(TMPDIR)\fts3_hash.obj \
	$(TMPDIR)\fts3_icu.obj \
	$(TMPDIR)\fts3_porter.obj \
	$(TMPDIR)\fts3_tokenizer.obj \
	$(TMPDIR)\fts3_tokenizer1.obj

FTS3HDR= $(HDR) \
	$(FTS3SRC)\fts3.h \
	$(FTS3SRC)\fts3_hash.h \
	$(FTS3SRC)\fts3_tokenizer.h

all:	sqlite3.dll libsqlite3.lib sqlite3.exe
sqlite3.exe: setup $(OUTDIR)\sqlite3.exe
sqlite3.dll: setup $(OUTDIR)\sqlite3.dll
libsqlite3.lib: setup $(OUTDIR)\libsqlite3.lib
lemon: setup $(OUTDIR)\lemon.exe

$(OUTDIR)\sqlite3.dll:	$(LIBOBJ) $(FTS3OBJ) $(TMPDIR)\version.obj $(TMPSRC)\sqlite3.def
	$(LD) $(LDFLAGS) -dll -def:$(TMPSRC)\sqlite3.def -out:$@ @<<
$(LIBOBJ)
<<
	$(AR) $(OUTDIR)\sqlite3.lib $(TMPDIR)\version.obj

$(OUTDIR)\libsqlite3.lib: $(LIBOBJ)
	$(AR) -out:$@ @<<
$(LIBOBJ)
<<

$(OUTDIR)\sqlite3.exe: $(OUTDIR)\sqlite3.dll $(TMPDIR)\shell.obj
	$(TCCX) -o $@ $(TMPDIR)\shell.obj $(OUTDIR)\sqlite3.lib

$(TMPSRC)\sqlite3.def: $(ROOT)\sqlite3.def
	$(COPY) $** $@ >NUL

#$(ROOT)\sqlite3.def: $(SRCDIR)\sqlite.h.in
#	@awk -f << >$@ $** 
#BEGIN { print "LIBRARY \"sqlite3\"\nEXPORTS\n"; }
#/^[a-z]* (sqlite3_.*)\(/ {
#    sub(/^[a-z]* /,"",$$0)
#    sub(/\(.*/,"",$$0)
#    print $$0
#}
#<<

# Rules to build the LEMON compiler generator

$(OUTDIR)\lemon.exe: $(TOOLDIR)\lemon.c $(TOOLDIR)\lempar.c
	$(BCC) -o $@ -Fo$(TMPDIR)\ $(TOOLDIR)\lemon.c

$(TMPDIR)\alter.obj:	$(SRCDIR)\alter.c $(HDR)
$(TMPDIR)\analyze.obj:	$(SRCDIR)\analyze.c $(HDR)
$(TMPDIR)\attach.obj:	$(SRCDIR)\attach.c $(HDR)
$(TMPDIR)\auth.obj:	$(SRCDIR)\auth.c $(HDR)
$(TMPDIR)\bitvec.obj:	$(SRCDIR)\bitvec.c $(HDR)
$(TMPDIR)\btmutex.obj:	$(SRCDIR)\btmutex.c $(HDR)
$(TMPDIR)\btree.obj:	$(SRCDIR)\btree.c $(HDR) $(SRCDIR)\pager.h
$(TMPDIR)\build.obj:	$(SRCDIR)\build.c $(HDR)
$(TMPDIR)\callback.obj:	$(SRCDIR)\callback.c $(HDR)
$(TMPDIR)\complete.obj:	$(SRCDIR)\complete.c $(HDR)
$(TMPDIR)\date.obj:	$(SRCDIR)\date.c $(HDR)
$(TMPDIR)\delete.obj:	$(SRCDIR)\delete.c $(HDR)
$(TMPDIR)\expr.obj:	$(SRCDIR)\expr.c $(HDR)
$(TMPDIR)\fault.obj:	$(SRCDIR)\fault.c $(HDR)
$(TMPDIR)\func.obj:	$(SRCDIR)\func.c $(HDR)
$(TMPDIR)\hash.obj:	$(SRCDIR)\hash.c $(HDR)
$(TMPDIR)\insert.obj:	$(SRCDIR)\insert.c $(HDR)
$(TMPDIR)\journal.obj:	$(SRCDIR)\journal.c $(HDR)
$(TMPDIR)\legacy.obj:	$(SRCDIR)\legacy.c $(HDR)
$(TMPDIR)\loadext.obj:	$(SRCDIR)\loadext.c $(HDR)
$(TMPDIR)\main.obj:	$(SRCDIR)\main.c $(HDR)
$(TMPDIR)\malloc.obj:	$(SRCDIR)\malloc.c $(HDR)
$(TMPDIR)\mem1.obj:	$(SRCDIR)\mem1.c $(HDR)
$(TMPDIR)\mem2.obj:	$(SRCDIR)\mem2.c $(HDR)
$(TMPDIR)\mem3.obj:	$(SRCDIR)\mem3.c $(HDR)
$(TMPDIR)\mem4.obj:	$(SRCDIR)\mem4.c $(HDR)
$(TMPDIR)\mem5.obj:	$(SRCDIR)\mem5.c $(HDR)
$(TMPDIR)\mutex.obj:	$(SRCDIR)\mutex.c $(HDR)
$(TMPDIR)\mutex_os2.obj:	$(SRCDIR)\mutex_os2.c $(HDR)
$(TMPDIR)\mutex_unix.obj:	$(SRCDIR)\mutex_unix.c $(HDR)
$(TMPDIR)\mutex_w32.obj:	$(SRCDIR)\mutex_w32.c $(HDR)
$(TMPDIR)\opcodes.obj:	$(TMPSRC)\opcodes.c $(HDR)
$(TMPDIR)\os.obj:	$(SRCDIR)\os.c $(HDR)
$(TMPDIR)\os_os2.obj:	$(SRCDIR)\os_os2.c $(HDR)
$(TMPDIR)\os_unix.obj:	$(SRCDIR)\os_unix.c $(HDR)
$(TMPDIR)\os_win.obj:	$(SRCDIR)\os_win.c $(HDR)
$(TMPDIR)\pager.obj:	$(SRCDIR)\pager.c $(HDR) $(SRCDIR)\pager.h
$(TMPDIR)\parse.obj:	$(TMPSRC)\parse.h $(HDR)
$(TMPDIR)\pragma.obj:	$(SRCDIR)\pragma.c $(HDR)
$(TMPDIR)\prepare.obj:	$(SRCDIR)\prepare.c $(HDR)
$(TMPDIR)\printf.obj:	$(SRCDIR)\printf.c $(HDR)
$(TMPDIR)\random.obj:	$(SRCDIR)\random.c $(HDR)
$(TMPDIR)\select.obj:	$(SRCDIR)\select.c $(HDR)
$(TMPDIR)\table.obj:	$(SRCDIR)\table.c $(HDR)
$(TMPDIR)\tokenize.obj:	$(SRCDIR)\tokenize.c $(TMPSRC)\keywordhash.h $(HDR)
$(TMPDIR)\trigger.obj:	$(SRCDIR)\trigger.c $(HDR)
$(TMPDIR)\update.obj:	$(SRCDIR)\update.c $(HDR)
$(TMPDIR)\utf.obj:	$(SRCDIR)\utf.c $(HDR)
$(TMPDIR)\util.obj:	$(SRCDIR)\util.c $(HDR)
$(TMPDIR)\vacuum.obj:	$(SRCDIR)\vacuum.c $(HDR)
$(TMPDIR)\vdbe.obj:	$(SRCDIR)\vdbe.c $(VDBEHDR)
$(TMPDIR)\vdbeapi.obj:	$(SRCDIR)\vdbeapi.c $(VDBEHDR)
$(TMPDIR)\vdbeaux.obj:	$(SRCDIR)\vdbeaux.c $(VDBEHDR)
$(TMPDIR)\vdbefifo.obj:	$(SRCDIR)\vdbefifo.c $(VDBEHDR)
$(TMPDIR)\vdbemem.obj:	$(SRCDIR)\vdbemem.c $(VDBEHDR)
$(TMPDIR)\vtab.obj:	$(SRCDIR)\vtab.c $(VDBEHDR)
$(TMPDIR)\where.obj:	$(SRCDIR)\where.c $(HDR)

$(TMPDIR)\icu.obj:	$(SRCDIR)\ext\icu\icu.c $(HDR) $(EXTHDR)

$(TMPDIR)\fts2.obj:		$(FTS2SRC)\fts2.c $(FTS2HDR)
$(TMPDIR)\fts2_hash.obj:	$(FTS2SRC)\fts2_hash.c $(FTS2HDR)
$(TMPDIR)\fts2_icu.obj:		$(FTS2SRC)\fts2_icu.c $(FTS2HDR)
$(TMPDIR)\fts2_porter.obj:	$(FTS2SRC)\fts2_porter.c $(FTS2HDR)
$(TMPDIR)\fts2_tokenizer.obj:	$(FTS2SRC)\fts2_tokenizer.c $(FTS2HDR)
$(TMPDIR)\fts2_tokenizer1.obj:	$(FTS2SRC)\fts2_tokenizer1.c $(FTS2HDR)

$(TMPDIR)\fts3.obj:		$(FTS3SRC)\fts3.c $(FTS3HDR)
$(TMPDIR)\fts3_hash.obj:	$(FTS3SRC)\fts3_hash.c $(FTS3HDR)
$(TMPDIR)\fts3_icu.obj:		$(FTS3SRC)\fts3_icu.c $(FTS3HDR)
$(TMPDIR)\fts3_porter.obj:	$(FTS3SRC)\fts3_porter.c $(FTS3HDR)
$(TMPDIR)\fts3_tokenizer.obj:	$(FTS3SRC)\fts3_tokenizer.c $(FTS3HDR)
$(TMPDIR)\fts3_tokenizer1.obj:	$(FTS3SRC)\fts3_tokenizer1.c $(FTS3HDR)

$(TMPSRC)\sqlite3.h:	$(SRCDIR)\sqlite.h.in
        @type << >$(TMPDIR)\sqlite3h.tmp
NR == FNR {
  VERSION=$$0
  n=split($$0,v,".");
  RELEASE=sprintf("%d%03d%03d", v[1], v[2], v[3]);
  next;
}
/--VERSION-NUMBER--/ { sub(/--VERSION-NUMBER--/,RELEASE); }
/--VERS--/ { sub(/--VERS--/,VERSION); }
{print;}
<<
        @$(AWK) -f $(TMPDIR)\sqlite3h.tmp $(ROOT)\VERSION $(SRCDIR)\sqlite.h.in > $@
	@$(COPY) $@ $(OUTDIR)\sqlite3.h >NUL

$(TMPSRC)\keywordhash.h: $(TOOLDIR)\mkkeywordhash.c
	$(BCC) -o $(TMPDIR)\mkkeywordhash.exe $(OPTS) -Fo$(TMPDIR)\ $(TOOLDIR)\mkkeywordhash.c
	$(TMPDIR)\mkkeywordhash.exe > $@

$(TMPSRC)\config.h:
	@type << >$(TMPDIR)\config_h.c
#include <stdlib.h>
#include <stdio.h>
int main()
{
    printf("#define SQLITE_PTR_SZ %d\n", sizeof(char*));
    exit(0);
}
<<
	$(CC) -o $(TMPDIR)\config_h.exe -Fo$(TMPDIR)\ $(TMPDIR)\config_h.c
	@$(TMPDIR)\config_h.exe > $(TMPSRC)\config.h

$(TMPSRC)\parse.c: $(SRCDIR)\parse.y lemon
	@$(COPY) $(TOOLDIR)\lempar.c $(OUTDIR)\lempar.c >NUL
	@$(COPY) $(SRCDIR)\parse.y $(TMPSRC)\parse.y >NUL
	@$(OUTDIR)\lemon.exe $(TMPSRC)\parse.y
        @$(COPY) $(TMPSRC)\parse.h $(TMPSRC)\parse.h.temp >NUL
        $(AWK) -f $(ROOT)\addopcodes.awk $(TMPSRC)\parse.h.temp > $(TMPSRC)\parse.h

$(TMPSRC)\parse.h: $(TMPSRC)\parse.c

$(TMPSRC)\opcodes.h: $(TMPSRC)\parse.h $(SRCDIR)\vdbe.c
        @$(COPY) $(TMPSRC)\parse.h + $(SRCDIR)\vdbe.c $(TMPDIR)\vdbe.c.temp >NUL
        $(AWK) -f $(ROOT)/mkopcodeh.awk $(TMPDIR)\vdbe.c.temp > $(TMPSRC)\opcodes.h

$(TMPSRC)\opcodes.c: $(TMPSRC)\opcodes.h
        $(AWK) -f $(ROOT)\mkopcodec.awk $(TMPSRC)\opcodes.h > $@

$(TMPSRC)\version.c:
	@type << > $@
#include "sqlite3.h"
const char sqlite3_version[] = SQLITE_VERSION;
<<

#-------------------------------------------------------------------------

.SUFFIXES: .c

{$(SRCDIR)}.c{$(TMPDIR)}.obj::
        $(TCCXD) -Fo$(TMPDIR)\ -c @<<
$<
<<

{$(TMPSRC)}.c{$(TMPDIR)}.obj::
        $(TCCXD) -Fo$(TMPDIR)\ -c @<<
$<
<<

{$(FTS2SRC)}.c{$(TMPDIR)}.obj::
	$(TCCXD) -Fo$(TMPDIR)\ -DSQLITE_CORE -c @<<
$<
<<

{$(FTS3SRC)}.c{$(TMPDIR)}.obj::
	$(TCCXD) -Fo$(TMPDIR)\ -DSQLITE_CORE -c @<<
$<
<<

#-------------------------------------------------------------------------

setup:
        @if not exist $(OUTDIR) mkdir $(OUTDIR)
        @if not exist $(TMPDIR) mkdir $(TMPDIR)
        @if not exist $(TMPSRC) mkdir $(TMPSRC)

clean:
	@if exist $(TMPDIR) $(RMDIR) $(TMPDIR) >NUL
	@if exist $(TMPSRC) $(RMDIR) $(TMPSRC) >NUL

realclean:
	@if exist $(OUTDIR) $(RMDIR) $(OUTDIR) >NUL
